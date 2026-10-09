import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLanguage } from "../hooks/useLanguage";
import { Colors } from "../constants/Colors";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const isHi = locale === "hi";

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => setLocale("en")}
        style={[
          styles.pill,
          !isHi && styles.activePill,
        ]}
      >
        <Text
          style={[styles.text, !isHi && styles.activeText]}
        >
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setLocale("hi")}
        style={[styles.pill, isHi && styles.activePill]}
      >
        <Text style={[styles.text, isHi && styles.activeText]}>
          हिन्दी
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
    padding: 4,
    alignSelf: "flex-start",
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activePill: {
    backgroundColor: Colors.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  activeText: {
    color: Colors.textInverse,
  },
});
