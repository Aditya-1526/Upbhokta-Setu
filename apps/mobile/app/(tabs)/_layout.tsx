import { Tabs } from "expo-router";
import { useLanguage } from "../../hooks/useLanguage";
import { Colors } from "../../constants/Colors";

function TabIcon({ label }: { label: string }) {
  return null;
}

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="cases"
        options={{
          title: t.navCases,
          tabBarIcon: () => <TabIcon label={t.navCases} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t.navCreate,
          tabBarIcon: () => <TabIcon label={t.navCreate} />,
        }}
      />
      <Tabs.Screen
        name="evidence"
        options={{
          title: t.navEvidence,
          tabBarIcon: () => <TabIcon label={t.navEvidence} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.navSettings,
          tabBarIcon: () => <TabIcon label={t.navSettings} />,
        }}
      />
    </Tabs>
  );
}
