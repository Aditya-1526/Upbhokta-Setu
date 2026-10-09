import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../../hooks/useLanguage";
import { Screen } from "../../components/Screen";
import { Colors } from "../../constants/Colors";
import { createCase, type CreateCasePayload } from "../../lib/api";

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

type FieldKey = keyof CreateCasePayload;

export default function CreateScreen() {
  const { t, locale } = useLanguage();
  const router = useRouter();
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

  const set = (key: FieldKey, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError(null);

    if (
      !form.seller_name.trim() ||
      !form.product_name.trim() ||
      !form.description.trim()
    ) {
      setError(t.createErrorRequired);
      return;
    }

    if (!form.purchase_date.trim()) {
      setError(t.createLabelPurchaseDate + " " + t.createErrorRequired);
      return;
    }

    const amount = parseFloat(String(form.amount_inr));
    if (isNaN(amount) || amount < 0) {
      setError(t.createErrorAmount);
      return;
    }

    setSaving(true);
    try {
      const payload: CreateCasePayload = {
        ...form,
        amount_inr: parseFloat(String(form.amount_inr)),
      };
      const created = await createCase(payload);
      Alert.alert(
        t.createSuccess,
        "",
        [
          {
            text: t.back,
            onPress: () => {
              router.replace({
                pathname: "/case-detail",
                params: { id: created.id },
              });
            },
          },
        ],
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const l = (en: string, hi: string) => (locale === "hi" ? hi : en);

  return (
    <Screen title="createTitle">
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <Field
            label={t.createLabelSeller}
            value={form.seller_name}
            onChange={(v) => set("seller_name", v)}
            placeholder={t.createPlaceholderSeller}
            autoCapitalize="words"
          />
          <Field
            label={t.createLabelProduct}
            value={form.product_name}
            onChange={(v) => set("product_name", v)}
            placeholder={t.createPlaceholderProduct}
            autoCapitalize="sentences"
          />
          <Field
            label={t.createLabelPurchaseDate}
            value={form.purchase_date}
            onChange={(v) => set("purchase_date", v)}
            placeholder={l("YYYY-MM-DD", "YYYY-MM-DD")}
            autoCapitalize="none"
          />
          <Field
            label={t.createLabelAmount}
            value={String(form.amount_inr)}
            onChange={(v) => set("amount_inr", v)}
            placeholder={t.createPlaceholderAmount}
            keyboardType="numeric"
          />
          <PickerField
            label={t.createLabelCategory}
            value={form.problem_category}
            options={CATEGORIES}
            onChange={(v) => set("problem_category", v)}
          />
          <Field
            label={t.createLabelDescription}
            value={form.description}
            onChange={(v) => set("description", v)}
            placeholder={t.createPlaceholderDescription}
            multiline
            numberOfLines={5}
          />
          <PickerField
            label={t.createLabelResolution}
            value={form.desired_resolution}
            options={RESOLUTIONS}
            onChange={(v) => set("desired_resolution", v)}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity
            style={[styles.submit, saving && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Text style={styles.submitText}>
              {saving ? t.createSaving : t.createSubmit}
            </Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>{t.disclaimer}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  numberOfLines,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize ?? "sentences"}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

function PickerField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; en: string; hi: string }[];
  onChange: (v: string) => void;
}) {
  const { locale } = useLanguage();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerRow}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pill, selected && styles.pillActive]}
              onPress={() => onChange(opt.value)}
            >
              <Text
                style={[
                  styles.pillText,
                  selected && styles.pillTextActive,
                ]}
              >
                {locale === "hi" ? opt.hi : opt.en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  form: { gap: 16 },
  field: { gap: 4 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
  },
  pillTextActive: {
    color: Colors.textInverse,
  },
  submit: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: Colors.textInverse,
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: Colors.error,
    fontSize: 13,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
});
