import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { useLanguage } from "../hooks/useLanguage";
import { Screen } from "../components/Screen";
import { Colors } from "../constants/Colors";
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Clipboard } from "react-native";
import {
  fetchCaseById,
  generateDraft,
  type CaseRecord,
  type DraftRecord,
} from "../lib/api";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const categoryEn: Record<string, string> = {
  defective: "Defective",
  not_delivered: "Not Delivered",
  service_quality: "Service Quality",
  refund_issue: "Refund Issue",
  fraud: "Fraud",
  other: "Other",
};
const categoryHi: Record<string, string> = {
  defective: "दोषपूर्ण",
  not_delivered: "सामान डिलीवर नहीं हुआ",
  service_quality: "सेवा गुणवत्ता",
  refund_issue: "धनवापसी की समस्या",
  fraud: "धोखाधड़ी",
  other: "अन्य",
};
const resolutionEn: Record<string, string> = {
  refund: "Refund",
  replacement: "Replacement",
  repair: "Repair",
  other: "Other",
};
const resolutionHi: Record<string, string> = {
  refund: "धन वापसी",
  replacement: "प्रतिस्थापन",
  repair: "मरम्मत",
  other: "अन्य",
};

type DraftState = "idle" | "loading" | "ready" | "error";

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useLanguage();
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [draftError, setDraftError] = useState(false);
  const [draftLang, setDraftLang] = useState<"en" | "hi">("en");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof id === "string") {
          const data = await fetchCaseById(id);
          if (!cancelled) setCaseData(data);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleGenerate = async () => {
    if (!caseData) return;
    setDraftState("loading");
    setDraftError(false);
    try {
      const result = await generateDraft(caseData.id, draftLang);
      setDraft(result);
      setDraftState("ready");
    } catch {
      setDraftState("error");
      setDraftError(true);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    Clipboard.setString(`${draft.title}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t.errorGeneric}</Text>
        </View>
      );
    }

    if (!caseData) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t.casesEmptyTitle}</Text>
        </View>
      );
    }

    const c = caseData;
    const catLabel = locale === "hi"
      ? categoryHi[c.problem_category] ?? c.problem_category
      : categoryEn[c.problem_category] ?? c.problem_category;
    const resLabel = locale === "hi"
      ? resolutionHi[c.desired_resolution] ?? c.desired_resolution
      : resolutionEn[c.desired_resolution] ?? c.desired_resolution;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Case details card */}
        <View style={styles.card}>
          <Row label={t.caseDetailSeller} value={c.seller_name} />
          <Row label={t.caseDetailProduct} value={c.product_name} />
          <Row
            label={t.caseDetailAmount}
            value={`₹${c.amount_inr.toLocaleString("en-IN")}`}
          />
          <Row label={t.caseDetailDate} value={formatDate(c.purchase_date)} />
          <Row label={t.caseDetailCategory} value={catLabel} />
          <Row label={t.caseDetailResolution} value={resLabel} />
          <Row label={t.caseDetailDescription} value={c.description} multiline />
        </View>

        {/* AI Draft section */}
        <View style={styles.aiSection}>
          <Text style={styles.aiSectionTitle}>{t.aiTitle}</Text>

          {/* Language picker */}
          <View style={styles.langRow}>
            <Text style={styles.langLabel}>{t.settingsLanguage}: </Text>
            {(["en", "hi"] as const).map((l) => (
              <DraftLangButton
                key={l}
                label={l === "en" ? "English" : "हिन्दी"}
                selected={draftLang === l}
                onPress={() => setDraftLang(l)}
              />
            ))}
          </View>

          {/* Generate button */}
          {draftState !== "ready" && draftState !== "loading" && (
            <DraftButton
              title={t.aiGenerateButton}
              onPress={handleGenerate}
              variant="primary"
            />
          )}

          {/* Loading */}
          {draftState === "loading" && (
            <View style={styles.centeredSmall}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.aiLoadingText}>{t.aiGenerating}</Text>
            </View>
          )}

          {/* Error */}
          {draftState === "error" && (
            <View style={styles.aiErrorBox}>
              <Text style={styles.aiErrorTitle}>{t.aiErrorTitle}</Text>
              <Text style={styles.aiErrorBody}>{t.aiErrorBody}</Text>
              <DraftButton
                title={t.retry}
                onPress={handleGenerate}
                variant="outline"
              />
            </View>
          )}

          {/* Draft display */}
          {draftState === "ready" && draft && (
            <View style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <Text style={styles.draftTitleLabel}>
                  {t.aiDraftTitle}: {draft.title}
                </Text>
                {!draft.is_ai_generated && (
                  <View style={styles.fallbackBadge}>
                    <Text style={styles.fallbackBadgeText}>{t.aiFallbackLabel}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.draftBodyLabel}>{t.aiDraftBody}:</Text>
              <View style={styles.draftBodyBox}>
                <Text style={styles.draftBodyText}>{draft.body}</Text>
              </View>

              {/* Copy button */}
              <DraftButton
                title={copied ? t.aiCopySuccess : t.aiCopy}
                onPress={handleCopy}
                variant="outline"
              />

              {/* Review notice */}
              <View style={styles.reviewBox}>
                <Text style={styles.reviewText}>{t.aiNeedsReview}</Text>
              </View>

              {/* Legal references */}
              {draft.legal_references.length > 0 && (
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>{t.aiDraftLegalRefs}:</Text>
                  {draft.legal_references.map((ref, i) => (
                    <Text key={i} style={styles.metaItem}>{"• " + ref}</Text>
                  ))}
                </View>
              )}

              {/* Missing info */}
              {draft.missing_information.length > 0 && (
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>{t.aiDraftMissing}:</Text>
                  {draft.missing_information.map((info, i) => (
                    <Text key={i} style={styles.metaItem}>{"• " + info}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <Screen title="caseDetailTitle">
      {renderBody()}
      {caseData && !loading && !error && (
        <Text style={styles.idText}>
          {t.caseDetailId}: {caseData.id.slice(0, 8)}
        </Text>
      )}
    </Screen>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={multiline ? undefined : 1}>
        {value}
      </Text>
    </View>
  );
}

function DraftLangButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={[
        styles.langBtn,
        selected ? styles.langBtnSelected : styles.langBtnUnselected,
      ]}
    >
      {label}
    </Text>
  );
}

function DraftButton({
  title,
  onPress,
  variant,
}: {
  title: string;
  onPress: () => void;
  variant: "primary" | "outline";
}) {
  return (
    <Text
      onPress={onPress}
      style={[
        styles.draftBtn,
        variant === "primary" ? styles.draftBtnPrimary : styles.draftBtnOutline,
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
  },
  row: { gap: 4 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: { fontSize: 16, color: Colors.text },
  idText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  centeredSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  // AI section
  aiSection: {
    marginTop: 20,
    gap: 12,
  },
  aiSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  langBtnSelected: {
    backgroundColor: Colors.primary,
    color: "#fff",
  },
  langBtnUnselected: {
    backgroundColor: Colors.border,
    color: Colors.text,
  },
  draftBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  draftBtnPrimary: {
    backgroundColor: Colors.primary,
    color: "#fff",
  },
  draftBtnOutline: {
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
  },
  aiLoadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  aiErrorBox: {
    backgroundColor: "#FFF3F3",
    borderRadius: 8,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  aiErrorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.error,
  },
  aiErrorBody: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  draftCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  draftHeader: {
    gap: 6,
  },
  draftTitleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  fallbackBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  fallbackBadgeText: {
    fontSize: 12,
    color: "#F57C00",
    fontWeight: "600",
  },
  draftBodyLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  draftBodyBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  draftBodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  } as any,
  reviewBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  reviewText: {
    fontSize: 13,
    color: "#2E7D32",
    lineHeight: 18,
  },
  metaBox: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 4,
  },
  metaItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingLeft: 8,
  },
});
