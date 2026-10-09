# LOCALIZATION.md — Bilingual (English / हिन्दी) Implementation

## Locale Codes
- `en` — English (default, first-launch)
- `hi` — हिन्दी (Hindi)

## Storage
- `expo-secure-store` — persists language preference across app restarts.
- Key: `app_language`
- Values: `"en"` or `"hi"`
- Fallback: `"en"` if the stored value is missing or corrupt.

## Language Provider (`apps/mobile/hooks/useLanguage.ts`)
- Wraps the app in a React Context.
- Reads/writes language from `expo-secure-store`.
- Triggers a re-render of all subscribed components when language changes.
- Does NOT require an app restart to apply.

## Translation Files
- `apps/mobile/i18n/en.json` — English strings
- `apps/mobile/i18n/hi.json` — Hindi strings
- Structure: flat or nested JSON with string values.
- Every user-facing string must have a key in both files.
- Missing Hindi key → fallback to English.

## Translating Guidelines
- Use Devanagari Unicode throughout (UTF-8). No transliteration.
- Keep legal terms, statute names, organization names, and URLs in their original form.
- Label AI-generated content as AI-generated in both languages.
- Do not machine-translate official source text and present it as an official translation.

## Covered Strings (minimum)
- Navigation labels (tabs, drawer, back button)
- Form field labels, placeholders, and validation messages
- Loading, empty, error, and success states
- Consent / privacy notices
- AI response labels and disclaimers
- Settings screen labels
- Case detail and status text

## Typography
- Ensure Devanagari glyphs render correctly on all target devices.
- Use a font with broad Devanagari coverage (system default or explicit font import).
- Test on low-end Android devices.
