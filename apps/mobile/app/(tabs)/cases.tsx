import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useLanguage } from "../../hooks/useLanguage";
import { Screen } from "../../components/Screen";
import { EmptyState } from "../../components/EmptyState";
import { Colors } from "../../constants/Colors";
import { fetchCases, type CaseRecord } from "../../lib/api";

const CATEGORY_SHORT: Record<string, string> = {
  defective: "Defective",
  not_delivered: "Not Delivered",
  service_quality: "Service",
  refund_issue: "Refund",
  fraud: "Fraud",
  other: "Other",
};

function formatDate(d: string): string {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function CasesScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCases();
      setCases(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-fetch when navigating back to this tab
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const renderContent = () => {
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
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>{t.retry}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (cases.length === 0) {
      return (
        <EmptyState
          title="casesEmptyTitle"
          subtitle="casesEmptySubtitle"
          actionLabel="landingCta"
          onAction={() => router.push("/create")}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {cases.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/case-detail",
                params: { id: c.id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {c.product_name}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{t.casesStatusFiled}</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {c.seller_name}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>
                ₹{c.amount_inr.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaText}>
                {CATEGORY_SHORT[c.problem_category] ?? c.problem_category}
              </Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaText}>{formatDate(c.purchase_date)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return <Screen title="casesTitle">{renderContent()}</Screen>;
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: Colors.primaryLight + "22",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metaDivider: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.textInverse,
    fontWeight: "600",
  },
});
