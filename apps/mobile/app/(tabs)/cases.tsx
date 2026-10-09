import { useRouter } from "expo-router";
import { useLanguage } from "../../hooks/useLanguage";
import { Screen } from "../../components/Screen";
import { EmptyState } from "../../components/EmptyState";
import { Colors } from "../../constants/Colors";
import { StyleSheet, Text, ScrollView } from "react-native";

export default function CasesScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <Screen title="casesTitle">
      <ScrollView contentContainerStyle={styles.content}>
        <EmptyState
          title="casesEmptyTitle"
          subtitle="casesEmptySubtitle"
          actionLabel="landingCta"
          onAction={() => router.push("/create")}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
});
