import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useLanguage } from "../hooks/useLanguage";
import { createCase, type CreateCasePayload } from "../api";
import { COLORS } from "../components/Layout";

const CATEGORIES = [
  { value: "defective", en: "Defective", hi: "दोषपूर्ण" },
  { value: "not_delivered", en: "Not Delivered", hi: "सामान डिलीवर नहीं हुआ" },
  { value: "service_quality", en: "Service Quality", hi: "सेवा गुणवत्ता" },
  { value: "refund_issue", en: "Refund Issue", hi: "धनवापसी की समस्या" },
  { value: "fraud", en: "Fraud", hi: "धोखाधड़ी" },
  { value: "other", en: "Other", hi: "अन्य" },
];

const RESOLUTIONS = [
  { value: "refund", en: "Refund", hi: "धन वापसी" },
  { value: "replacement", en: "Replacement", hi: "प्रतिस्थापन" },
  { value: "repair", en: "Repair", hi: "मरम्मत" },
  { value: "other", en: "Other", hi: "अन्य" },
];

export default function CreatePage() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateCasePayload>({
    product_name: "",
    seller_name: "",
    purchase_date: "",
    amount_inr: 0,
    problem_category: "defective",
    description: "",
    desired_resolution: "refund",
  });

  const set = (key: keyof CreateCasePayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.seller_name.trim() || !form.product_name.trim() || !form.description.trim()) {
      setError(t.createErrorRequired);
      return;
    }
    if (!form.purchase_date.trim()) {
      setError(t.createErrorRequired);
      return;
    }
    const amount = parseFloat(String(form.amount_inr));
    if (isNaN(amount) || amount < 0) {
      setError(t.createErrorAmount);
      return;
    }

    setSaving(true);
    try {
      const created = await createCase({ ...form, amount_inr: amount });
      navigate(`/case/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title={t.createTitle}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <Field
          label={t.createLabelSeller}
          value={form.seller_name}
          onChange={(v) => set("seller_name", v)}
          placeholder={t.createPlaceholderSeller}
        />
        <Field
          label={t.createLabelProduct}
          value={form.product_name}
          onChange={(v) => set("product_name", v)}
          placeholder={t.createPlaceholderProduct}
        />
        <Field
          label={t.createLabelPurchaseDate}
          value={form.purchase_date}
          onChange={(v) => set("purchase_date", v)}
          placeholder="YYYY-MM-DD"
        />
        <Field
          label={t.createLabelAmount}
          value={String(form.amount_inr || "")}
          onChange={(v) => set("amount_inr", v)}
          placeholder={t.createPlaceholderAmount}
          type="number"
        />
        <PickerField
          label={t.createLabelCategory}
          value={form.problem_category}
          options={CATEGORIES}
          onChange={(v) => set("problem_category", v)}
          locale={locale}
        />
        <Field
          label={t.createPlaceholderDescription}
          value={form.description}
          onChange={(v) => set("description", v)}
          placeholder={t.createPlaceholderDescription}
          multiline
        />
        <PickerField
          label={t.createLabelResolution}
          value={form.desired_resolution}
          options={RESOLUTIONS}
          onChange={(v) => set("desired_resolution", v)}
          locale={locale}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={saving} style={styles.submit}>
          {saving ? t.createSaving : t.createSubmit}
        </button>
        <p style={styles.disclaimer}>{t.disclaimer}</p>
      </form>
    </Layout>
  );
}

function Field({ label, value, onChange, placeholder, multiline, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; multiline?: boolean; type?: string;
}) {
  const base = { ...styles.input };
  if (multiline) Object.assign(base, styles.textArea);
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          style={base}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          style={base}
        />
      )}
    </div>
  );
}

function PickerField({ label, value, options, onChange, locale }: {
  label: string; value: string;
  options: { value: string; en: string; hi: string }[];
  onChange: (v: string) => void;
  locale: "en" | "hi";
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <div style={styles.pickerRow}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              ...styles.pill,
              ...(value === opt.value ? styles.pillActive : {}),
            }}
          >
            <span style={{
              ...styles.pillText,
              ...(value === opt.value ? styles.pillTextActive : {}),
            }}>
              {locale === "hi" ? opt.hi : opt.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: "flex", flexDirection: "column" as const, gap: 16 },
  field: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: { fontSize: 14, fontWeight: 600, color: COLORS.text },
  input: {
    border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12,
    fontSize: 15, color: COLORS.text, backgroundColor: COLORS.surface,
    outline: "none", fontFamily: "inherit",
  },
  textArea: { minHeight: 120, resize: "vertical" as const },
  pickerRow: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
  pill: {
    padding: "8px 14px", borderRadius: 20,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.surface, cursor: "pointer",
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, fontWeight: 500, color: COLORS.text },
  pillTextActive: { color: COLORS.textInverse },
  submit: {
    backgroundColor: COLORS.primary, padding: "14px 0", borderRadius: 8,
    border: "none", cursor: "pointer", marginTop: 8,
    color: COLORS.textInverse, fontWeight: 700, fontSize: 16,
  },
  error: {
    color: COLORS.error, fontSize: 13, textAlign: "center" as const,
  },
  disclaimer: {
    fontSize: 12, color: COLORS.textSecondary, textAlign: "center" as const, marginTop: 4,
  },
};
