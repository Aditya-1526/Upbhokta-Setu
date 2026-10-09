import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLanguage } from "../hooks/useLanguage";
import { Colors } from "../constants/Colors";

export function Screen({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={styles.title}>{t[title as keyof typeof t] ?? title}</Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
});
