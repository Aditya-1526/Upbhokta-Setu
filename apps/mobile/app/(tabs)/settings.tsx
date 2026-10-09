import { ScrollView, View, Text, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../../hooks/useLanguage";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { Screen } from "../../components/Screen";
import { Colors } from "../../constants/Colors";

export default function SettingsScreen() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const isHi = locale === "hi";

  return (
    <Screen title="settingsTitle">
      <ScrollView style={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.settingsLanguage}</Text>
          <LanguageSwitcher />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.settingsAbout}</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.settingsVersion}</Text>
            <Text style={styles.rowValue}>0.1.0</Text>
          </View>
          <Text style={styles.tagline}>{t.tagline}</Text>
          <Text style={styles.disclaimer}>{t.disclaimer}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  rowValue: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 12,
    lineHeight: 18,
  },
});
