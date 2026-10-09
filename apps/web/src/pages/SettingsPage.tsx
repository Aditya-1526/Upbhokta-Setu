import { Layout } from "../components/Layout";
import { useLanguage } from "../hooks/useLanguage";
import { COLORS } from "../components/Layout";

export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const isHi = locale === "hi";

  return (
    <Layout title={t.settingsTitle}>
      <div style={styles.section}>
        <p style={styles.sectionLabel}>{t.settingsLanguage}</p>
        <div style={styles.langRow}>
          <button
            onClick={() => setLocale("en")}
            style={{
              ...styles.pill,
              ...(!isHi ? styles.pillActive : {}),
            }}
          >
            {t.settingsLanguageEn}
          </button>
          <button
            onClick={() => setLocale("hi")}
            style={{
              ...styles.pill,
              ...(isHi ? styles.pillActive : {}),
            }}
          >
            {t.settingsLanguageHi}
          </button>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <p style={styles.sectionLabel}>{t.settingsAbout}</p>
        <div style={styles.row}>
          <span style={styles.rowLabel}>{t.settingsVersion}</span>
          <span style={styles.rowValue}>0.1.0</span>
        </div>
        <p style={styles.tagline}>{t.tagline}</p>
        <p style={styles.disclaimer}>{t.disclaimer}</p>
      </div>
    </Layout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: { display: "flex", flexDirection: "column" as const, gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 8 },
  rowLabel: { fontSize: 15, color: COLORS.text },
  rowValue: { fontSize: 15, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, margin: "16px 0" },
  tagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  disclaimer: { fontSize: 12, color: COLORS.textSecondary, marginTop: 12, lineHeight: 18 },
  langRow: { display: "flex", gap: 8 },
  pill: {
    padding: "8px 20px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.surface, cursor: "pointer", fontSize: 14, fontWeight: 500,
  } as React.CSSProperties,
  pillActive: { backgroundColor: COLORS.primary, color: COLORS.textInverse, borderColor: COLORS.primary },
};
