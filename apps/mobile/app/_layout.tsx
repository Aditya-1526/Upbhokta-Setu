import { Stack } from "expo-router";
import { LanguageProvider } from "../hooks/useLanguage";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="case-detail" options={{ title: "Case Details" }} />
      </Stack>
    </LanguageProvider>
  );
}
