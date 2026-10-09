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

export default function CreateScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [merchant, setMerchant] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!merchant.trim() || !product.trim()) {
      Alert.alert(t.errorGeneric);
      return;
    }
    Alert.alert(t.createSuccess, "", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <Screen title="createTitle">
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <Field
            label={t.createLabelMerchant}
            value={merchant}
            onChange={setMerchant}
            placeholder={t.createPlaceholderMerchant}
            autoCapitalize="words"
          />
          <Field
            label={t.createLabelProduct}
            value={product}
            onChange={setProduct}
            placeholder={t.createPlaceholderProduct}
            autoCapitalize="sentences"
          />
          <Field
            label={t.createLabelAmount}
            value={amount}
            onChange={setAmount}
            placeholder={t.createPlaceholderAmount}
            keyboardType="numeric"
          />
          <Field
            label={t.createLabelDescription}
            value={description}
            onChange={setDescription}
            placeholder={t.createPlaceholderDescription}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
            <Text style={styles.submitText}>{t.createSubmit}</Text>
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 4,
  },
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
  submit: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: Colors.textInverse,
    fontWeight: "700",
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
});
