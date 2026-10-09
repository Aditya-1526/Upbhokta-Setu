import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useLanguage } from "../hooks/useLanguage";
import { fetchCaseById, generateDraft, type DraftRecord } from "../api";
import type { CaseRecord } from "../api";
import { COLORS } from "../components/Layout";

const CATEGORIES: Record<string, { en: string; hi: string }> = {
  defective: { en: "Defective", hi: "दोषपूर्ण" },
  not_delivered: { en: "Not Delivered", hi: "डिलीवर नहीं हुआ" },
  service_quality: { en: "Service Quality", hi: "सेवा गुणवत्ता" },
  refund_issue: { en: "Refund Issue", hi: "धनवापसी" },
  fraud: { en: "Fraud", hi: "धोखाधड़ी" },
  other: { en: "Other", hi: "अन्य" },
};

const RESOLUTIONS: Record<string, { en: string; hi: string }> = {
  refund: { en: "Refund", hi: "धन वापसी" },
  replacement: { en: "Replacement", hi: "प्रतिस्थापन" },
  repair: { en: "Repair", hi: "मरम्मत" },
  other: { en: "Other", hi: "अन्य" },
};

function formatDate(d: string): string {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLanguage();
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draftState, setDraftState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [draftLang, setDraftLang] = useState<"en" | "hi">("en");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCaseById(id);
        if (!cancelled) setCaseData(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleGenerate = async () => {
    if (!caseData) return;
    setDraftState("loading");
    try {
      const result = await generateDraft(caseData.id, draftLang);
      setDraft(result);
      setDraftState("ready");
    } catch {
      setDraftState("error");
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(`${draft.title}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout title={t.caseDetailTitle}>
      {loading && (
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>{t.loading}</p>
        </div>
      )}

      {error && !caseData && (
        <div style={styles.center}>
          <p style={styles.errorText}>{t.errorGeneric}</p>
          <Link to="/cases" style={styles.backLink}>{t.back}</Link>
        </div>
      )}

      {caseData && !loading && (
        <>
          <div style={styles.card}>
            <Row label={t.caseDetailSeller} value={caseData.seller_name} />
            <Row label={t.caseDetailProduct} value={caseData.product_name} />
            <Row label={t.caseDetailAmount} value={`₹${caseData.amount_inr.toLocaleString("en-IN")}`} />
            <Row label={t.caseDetailDate} value={formatDate(caseData.purchase_date)} />
            <Row label={t.caseDetailCategory} value={CATEGORIES[caseData.problem_category]?.[locale] ?? caseData.problem_category} />
            <Row label={t.caseDetailResolution} value={RESOLUTIONS[caseData.desired_resolution]?.[locale] ?? caseData.desired_resolution} />
            <Row label={t.caseDetailDescription} value={caseData.description} multiline />
          </div>

          <div style={styles.idBox}>
            {t.caseDetailId}: <code style={styles.idCode}>{caseData.id.slice(0, 8)}</code>
          </div>

          <div style={styles.aiSection}>
            <h3 style={styles.aiTitle}>{t.aiTitle}</h3>

            <div style={styles.langRow}>
              <span style={styles.langLabel}>{t.settingsLanguage}: </span>
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setDraftLang(l)}
                  style={{
                    ...styles.langBtn,
                    ...(draftLang === l ? styles.langBtnSel : styles.langBtnUn),
                  }}
                >
                  {l === "en" ? "English" : "हिन्दी"}
                </button>
              ))}
            </div>

            {draftState !== "ready" && draftState !== "loading" && (
              <button onClick={handleGenerate} style={styles.primaryBtn}>
                {t.aiGenerateButton}
              </button>
            )}

            {draftState === "loading" && (
              <div style={styles.loadingRow}>
                <div style={styles.smallSpinner} />
                <span style={styles.loadingText}>{t.aiGenerating}</span>
              </div>
            )}

            {draftState === "error" && (
              <div style={styles.errorBox}>
                <p style={styles.errorBoxTitle}>{t.aiErrorTitle}</p>
                <p style={styles.errorBoxBody}>{t.aiErrorBody}</p>
                <button onClick={handleGenerate} style={styles.outlineBtn}>
                  {t.retry}
                </button>
              </div>
            )}

            {draftState === "ready" && draft && (
              <div style={styles.draftCard}>
                <div style={styles.draftHeader}>
                  <strong>{t.aiDraftTitle}: {draft.title}</strong>
                  {!draft.is_ai_generated && (
                    <span style={styles.fallbackBadge}>{t.aiFallbackLabel}</span>
                  )}
                </div>
                <p style={styles.draftBodyLabel}>{t.aiDraftBody}</p>
                <div style={styles.draftBodyBox}>
                  <p style={styles.draftBodyText}>{draft.body}</p>
                </div>
                <button onClick={handleCopy} style={styles.outlineBtn}>
                  {copied ? t.aiCopySuccess : t.aiCopy}
                </button>
                <div style={styles.reviewBox}>
                  <p style={styles.reviewText}>{t.aiNeedsReview}</p>
                </div>
                {draft.legal_references.length > 0 && (
                  <Meta label={t.aiDraftLegalRefs} items={draft.legal_references} />
                )}
                {draft.missing_information.length > 0 && (
                  <Meta label={t.aiDraftMissing} items={draft.missing_information} />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={{ ...styles.rowValue, whiteSpace: multiline ? "pre-wrap" : "nowrap", overflow: multiline ? "visible" : "hidden", textOverflow: multiline ? "unset" : "ellipsis" }}>
        {value}
      </span>
    </div>
  );
}

function Meta({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={styles.metaBox}>
      <p style={styles.metaLabel}>{label}</p>
      {items.map((item, i) => (
        <p key={i} style={styles.metaItem}>{`• ${item}`}</p>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "48px 24px", gap: 12, textAlign: "center" as const,
  },
  spinner: {
    width: 36, height: 36, border: `3px solid ${COLORS.border}`,
    borderTopColor: COLORS.primary, borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8 },
  loadingRow: {
    display: "flex", alignItems: "center", gap: 8, padding: "12px 0",
  },
  smallSpinner: {
    width: 20, height: 20, border: `2px solid ${COLORS.border}`,
    borderTopColor: COLORS.primary, borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorText: { color: COLORS.error, fontSize: 14, padding: "0 24px" },
  backLink: { color: COLORS.primary, textDecoration: "none", marginTop: 8, fontWeight: 600 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    border: `1px solid ${COLORS.border}`, padding: 16, display: "flex",
    flexDirection: "column" as const, gap: 14,
  },
  row: { display: "flex", flexDirection: "column" as const, gap: 4 },
  rowLabel: { fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, textTransform: "uppercase" as const, letterSpacing: 0.4 },
  rowValue: { fontSize: 16, color: COLORS.text },
  idBox: { fontSize: 12, color: COLORS.textSecondary, marginTop: 12, textAlign: "center" as const },
  idCode: { fontFamily: "monospace", backgroundColor: COLORS.border, padding: "2px 6px", borderRadius: 4 },
  aiSection: { marginTop: 20, display: "flex", flexDirection: "column" as const, gap: 12 },
  aiTitle: { fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0 },
  langRow: { display: "flex", alignItems: "center", gap: 8 },
  langLabel: { fontSize: 14, color: COLORS.textSecondary },
  langBtn: { padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 },
  langBtnSel: { backgroundColor: COLORS.primary, color: COLORS.textInverse },
  langBtnUn: { backgroundColor: COLORS.border, color: COLORS.text },
  primaryBtn: {
    backgroundColor: COLORS.primary, color: COLORS.textInverse, padding: "12px 0",
    borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 15,
  },
  outlineBtn: {
    border: `1px solid ${COLORS.border}`, color: COLORS.text, padding: "12px 0",
    borderRadius: 8, backgroundColor: "transparent", cursor: "pointer",
    fontWeight: 600, fontSize: 15, textAlign: "center" as const,
  },
  errorBox: {
    backgroundColor: "#FFF3F3", borderRadius: 8, padding: 16, border: `1px solid #FFD0D0`,
  },
  errorBoxTitle: { fontSize: 14, fontWeight: 700, color: COLORS.error, margin: 0 },
  errorBoxBody: { fontSize: 13, color: COLORS.textSecondary, margin: "8px 0" },
  draftCard: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    border: `1px solid ${COLORS.border}`, padding: 16, display: "flex",
    flexDirection: "column" as const, gap: 12,
  },
  draftHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  draftBodyLabel: { fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, textTransform: "uppercase" as const, letterSpacing: 0.4 },
  draftBodyBox: {
    backgroundColor: "#FAFAFA", borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 12,
  },
  draftBodyText: { fontSize: 15, lineHeight: 22, color: COLORS.text, margin: 0 },
  fallbackBadge: {
    backgroundColor: "#FFF8E1", padding: "4px 10px", borderRadius: 4,
    border: `1px solid #FFE082`, fontSize: 12, color: "#F57C00", fontWeight: 600,
  },
  reviewBox: { backgroundColor: "#E8F5E9", borderRadius: 8, padding: 10, border: `1px solid #A5D6A7` },
  reviewText: { fontSize: 13, color: "#2E7D32", lineHeight: 18, margin: 0 },
  metaBox: { display: "flex", flexDirection: "column" as const, gap: 4, marginTop: 4 },
  metaLabel: { fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, textTransform: "uppercase" as const, letterSpacing: 0.4 },
  metaItem: { fontSize: 13, color: COLORS.textSecondary, paddingLeft: 8 },
};
