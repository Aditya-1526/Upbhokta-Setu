import { useLanguage } from "../../hooks/useLanguage";
import { Screen } from "../../components/Screen";
import { EmptyState } from "../../components/EmptyState";

export default function EvidenceScreen() {
  const { t } = useLanguage();

  return (
    <Screen title="evidenceTitle">
      <EmptyState
        title="evidenceEmptyTitle"
        subtitle="evidenceEmptySubtitle"
        actionLabel="evidenceUpload"
        onAction={() => {}}
      />
    </Screen>
  );
}
