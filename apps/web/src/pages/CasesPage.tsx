import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useLanguage } from "../hooks/useLanguage";
import { fetchCases, type CaseRecord } from "../api";
import { COLORS } from "../components/Layout";

const CATEGORIES: Record<string, { en: string; hi: string }> = {
  defective: { en: "Defective", hi: "दोषपूर्ण" },
  not_delivered: { en: "Not Delivered", hi: "डिलीवर नहीं हुआ" },
  service_quality: { en: "Service Quality", hi: "सेवा गुणवत्ता" },
  refund_issue: { en: "Refund Issue", hi: "धनवापसी" },
  fraud: { en: "Fraud", hi: "धोखाधड़ी" },
  other: { en: "Other", hi: "अन्य" },
};

function formatDate(d: string): string {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function CasesPage() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCases();
      setCases(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, [t.errorGeneric]);

  useEffect(() => { load(); }, [load]);

  return (
    <Layout title={t.casesTitle}>
      {loading && (
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>{t.loading}</p>
        </div>
      )}

      {error && (
        <div style={styles.center}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={load} style={styles.retryBtn}>{t.retry}</button>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div style={styles.center}>
          <p style={styles.emptyTitle}>{t.casesEmptyTitle}</p>
          <p style={styles.emptySub}>{t.casesEmptySubtitle}</p>
          <button onClick={() => navigate("/create")} style={styles.ctaBtn}>
            {t.landingCta}
          </button>
        </div>
      )}

      <div style={styles.list}>
        {cases.map((c) => (
          <div key={c.id} onClick={() => navigate(`/case/${c.id}`)} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>{c.product_name}</span>
              <span style={styles.badge}>{t.casesStatusFiled}</span>
            </div>
            <p style={styles.cardSub}>{c.seller_name}</p>
            <div style={styles.cardMeta}>
              <span>₹{c.amount_inr.toLocaleString("en-IN")}</span>
              <span style={styles.divider}>•</span>
              <span>{CATEGORIES[c.problem_category]?.[locale] ?? c.problem_category}</span>
              <span style={styles.divider}>•</span>
              <span>{formatDate(c.purchase_date)}</span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
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
  errorText: { color: COLORS.error, fontSize: 14, padding: "0 24px" },
  retryBtn: {
    marginTop: 8, padding: "10px 24px", borderRadius: 8,
    backgroundColor: COLORS.primary, color: COLORS.textInverse,
    border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
  },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
  ctaBtn: {
    marginTop: 12, padding: "12px 28px", borderRadius: 8,
    backgroundColor: COLORS.primary, color: COLORS.textInverse,
    border: "none", cursor: "pointer", fontWeight: 600, fontSize: 15,
  },
  list: { display: "flex", flexDirection: "column" as const, gap: 12 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    border: `1px solid ${COLORS.border}`, padding: 16, cursor: "pointer",
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: 600, color: COLORS.text, flex: 1 },
  badge: {
    backgroundColor: COLORS.primaryLight, color: COLORS.primary,
    padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
    textTransform: "uppercase" as const, letterSpacing: 0.4,
  },
  cardSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  cardMeta: {
    display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12,
    color: COLORS.textSecondary, flexWrap: "wrap" as const,
  },
  divider: { margin: "0 2px" },
};
