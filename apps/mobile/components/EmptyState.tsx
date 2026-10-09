import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLanguage } from "../hooks/useLanguage";
import { Colors } from "../constants/Colors";

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { t } = useLanguage();
  const resolvedTitle = t[title as keyof typeof t] ?? title;
  const resolvedSubtitle = t[subtitle as keyof typeof t] ?? subtitle;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>
            {t[actionLabel as keyof typeof t] ?? actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.textInverse,
    fontWeight: "600",
    fontSize: 15,
  },
});
