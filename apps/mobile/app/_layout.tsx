import { Stack } from "expo-router";
import { LanguageProvider } from "../hooks/useLanguage";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </LanguageProvider>
  );
}
