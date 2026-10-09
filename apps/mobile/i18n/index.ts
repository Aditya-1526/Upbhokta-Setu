export type TranslationKeys = {
  appName: string;
  tagline: string;
  navCases: string;
  navCreate: string;
  navEvidence: string;
  navSettings: string;
  landingTitle: string;
  landingSubtitle: string;
  landingCta: string;
  casesTitle: string;
  casesEmptyTitle: string;
  casesEmptySubtitle: string;
  casesStatusFiled: string;
  casesStatusUnderReview: string;
  casesStatusResolved: string;
  createTitle: string;
  createLabelSeller: string;
  createPlaceholderSeller: string;
  createLabelProduct: string;
  createPlaceholderProduct: string;
  createLabelPurchaseDate: string;
  createLabelAmount: string;
  createPlaceholderAmount: string;
  createLabelCategory: string;
  createLabelDescription: string;
  createPlaceholderDescription: string;
  createLabelResolution: string;
  createOptionRefund: string;
  createOptionReplacement: string;
  createOptionRepair: string;
  createOptionOther: string;
  createSubmit: string;
  createSaving: string;
  createSuccess: string;
  createErrorAmount: string;
  createErrorRequired: string;
  caseDetailTitle: string;
  caseDetailStatus: string;
  caseDetailId: string;
  caseDetailSeller: string;
  caseDetailProduct: string;
  caseDetailAmount: string;
  caseDetailDate: string;
  caseDetailCategory: string;
  caseDetailResolution: string;
  caseDetailDescription: string;
  evidenceTitle: string;
  evidenceEmptyTitle: string;
  evidenceEmptySubtitle: string;
  evidenceUpload: string;
  settingsTitle: string;
  settingsLanguage: string;
  settingsLanguageEn: string;
  settingsLanguageHi: string;
  settingsAbout: string;
  settingsVersion: string;
  loading: string;
  errorGeneric: string;
  retry: string;
  cancel: string;
  save: string;
  delete: string;
  confirm: string;
  back: string;
  aiGenerated: string;
  disclaimer: string;
  // --- Slice 4: AI draft generation ---
  aiTitle: string;
  aiGenerateButton: string;
  aiGenerating: string;
  aiDraftTitle: string;
  aiDraftBody: string;
  aiDraftLegalRefs: string;
  aiDraftMissing: string;
  aiFallbackLabel: string;
  aiNeedsReview: string;
  aiCopy: string;
  aiCopySuccess: string;
  aiErrorTitle: string;
  aiErrorBody: string;
  aiDraftNotAvailable: string;
};

export const en: TranslationKeys = {
  appName: "Upbhokta Setu",
  tagline: "Your consumer grievance, connected.",
  navCases: "My Cases",
  navCreate: "Create a Case",
  navEvidence: "Evidence Locker",
  navSettings: "Settings",
  landingTitle: "Filing a complaint made simple",
  landingSubtitle:
    "Organize your evidence, understand your rights, and prepare a grievance — in English or Hindi.",
  landingCta: "Create Your First Case",
  casesTitle: "My Cases",
  casesEmptyTitle: "No cases yet",
  casesEmptySubtitle: "Tap the + button to create your first grievance case.",
  casesStatusFiled: "Filed",
  casesStatusUnderReview: "Under Review",
  casesStatusResolved: "Resolved",
  createTitle: "New Case",
  createLabelSeller: "Seller / Platform Name",
  createPlaceholderSeller: "e.g. Amazon India, Flipkart, local shop name",
  createLabelProduct: "Product or Service",
  createPlaceholderProduct: "e.g. Laptop, broadband connection, insurance claim",
  createLabelPurchaseDate: "Purchase Date",
  createLabelAmount: "Amount Paid (INR)",
  createPlaceholderAmount: "0",
  createLabelCategory: "Problem Category",
  createLabelDescription: "What happened?",
  createPlaceholderDescription:
    "Describe the issue in your own words. Be as specific as possible.",
  createLabelResolution: "Desired Resolution",
  createOptionRefund: "Refund",
  createOptionReplacement: "Replacement",
  createOptionRepair: "Repair",
  createOptionOther: "Other",
  createSubmit: "Save Case",
  createSaving: "Saving…",
  createSuccess: "Case created successfully",
  createErrorAmount: "Please enter a valid amount.",
  createErrorRequired: "This field is required.",
  caseDetailTitle: "Case Details",
  caseDetailStatus: "Status",
  caseDetailId: "Case ID",
  caseDetailSeller: "Seller",
  caseDetailProduct: "Product",
  caseDetailAmount: "Amount",
  caseDetailDate: "Purchase Date",
  caseDetailCategory: "Category",
  caseDetailResolution: "Desired Resolution",
  caseDetailDescription: "Description",
  evidenceTitle: "Evidence Locker",
  evidenceEmptyTitle: "No evidence uploaded",
  evidenceEmptySubtitle:
    "Attach bills, screenshots, and messages to support your case.",
  evidenceUpload: "Upload",
  settingsTitle: "Settings",
  settingsLanguage: "Language",
  settingsLanguageEn: "English",
  settingsLanguageHi: "हिन्दी",
  settingsAbout: "About",
  settingsVersion: "Version",
  loading: "Loading…",
  errorGeneric: "Something went wrong. Please try again.",
  retry: "Retry",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  confirm: "Confirm",
  back: "Back",
  aiGenerated: "AI-generated — review carefully",
  disclaimer: "This is not legal advice. Consult a qualified professional.",
  aiTitle: "AI-assisted draft",
  aiGenerateButton: "Generate complaint draft",
  aiGenerating: "Generating draft…",
  aiDraftTitle: "Title",
  aiDraftBody: "Draft",
  aiDraftLegalRefs: "Legal references",
  aiDraftMissing: "Information to add before sending",
  aiFallbackLabel: "Draft prepared locally (not AI-generated)",
  aiNeedsReview:
    "This draft is a preparation aid. Review it carefully before sending to any official authority.",
  aiCopy: "Copy draft",
  aiCopySuccess: "Copied to clipboard",
  aiErrorTitle: "Could not generate draft",
  aiErrorBody:
    "An error occurred while contacting the AI service. Please try again.",
  aiDraftNotAvailable: "No draft generated yet.",
};

export const hi: TranslationKeys = {
  appName: "उपभोक्ता सेतु",
  tagline: "आपका उपभोक्ता अधिकार, आपकी सेवा में।",
  navCases: "मेरे केस",
  navCreate: "केस बनाएं",
  navEvidence: "साक्ष्य लॉकर",
  navSettings: "सेटिंग्स",
  landingTitle: "शिकायत दर्ज करना अब आसान",
  landingSubtitle:
    "अपना साक्ष्य व्यवस्थित करें, अपने अधिकारों को समझें, और शिकायत तैयार करें — अंग्रेजी या हिंदी में।",
  landingCta: "अपना पहला केस बनाएं",
  casesTitle: "मेरे केस",
  casesEmptyTitle: "अभी कोई केस नहीं है",
  casesEmptySubtitle:
    "अपना पहला शिकायत केस बनाने के लिए + बटन दबाएं।",
  casesStatusFiled: "दर्ज",
  casesStatusUnderReview: "समीक्षा में",
  casesStatusResolved: "हल हो गया",
  createTitle: "नया केस",
  createLabelSeller: "विक्रेता / प्लेटफॉर्म का नाम",
  createPlaceholderSeller: "उदा. अमेजन इंडिया, फ्लिपकार्ट, स्थानीय दुकान का नाम",
  createLabelProduct: "उत्पाद या सेवा",
  createPlaceholderProduct: "उदा. लैपटॉप, ब्रॉडबैंड कनेक्शन, बीमा दावा",
  createLabelPurchaseDate: "खरीद की तारीख",
  createLabelAmount: "भुगतान की राशि (INR)",
  createPlaceholderAmount: "0",
  createLabelCategory: "समस्या की श्रेणी",
  createLabelDescription: "क्या हुआ?",
  createPlaceholderDescription:
    "समस्या को अपने शब्दों में वर्णन करें। जितना संभव हो उतना विशिष्ट रहें।",
  createLabelResolution: "वांछित समाधान",
  createOptionRefund: "धन वापसी",
  createOptionReplacement: "प्रतिस्थापन",
  createOptionRepair: "मरम्मत",
  createOptionOther: "अन्य",
  createSubmit: "केस सहेजें",
  createSaving: "सहेज रहे हैं…",
  createSuccess: "केस सफलतापूर्वक बना",
  createErrorAmount: "कृपया एक वैध राशि दर्ज करें।",
  createErrorRequired: "यह फ़ील्ड आवश्यक है।",
  caseDetailTitle: "केस विवरण",
  caseDetailStatus: "स्थिति",
  caseDetailId: "केस आईडी",
  caseDetailSeller: "विक्रेता",
  caseDetailProduct: "उत्पाद",
  caseDetailAmount: "राशि",
  caseDetailDate: "खरीद की तारीख",
  caseDetailCategory: "श्रेणी",
  caseDetailResolution: "वांछित समाधान",
  caseDetailDescription: "विवरण",
  evidenceTitle: "साक्ष्य लॉकर",
  evidenceEmptyTitle: "कोई साक्ष्य अपलोड नहीं किया गया",
  evidenceEmptySubtitle:
    "अपने केस का समर्थन करने के लिए बिल, स्क्रीनशॉट और संदेश संलग्न करें।",
  evidenceUpload: "अपलोड करें",
  settingsTitle: "सेटिंग्स",
  settingsLanguage: "भाषा",
  settingsLanguageEn: "English",
  settingsLanguageHi: "हिन्दी",
  settingsAbout: "ऐप के बारे में",
  settingsVersion: "संस्करण",
  loading: "लोड हो रहा है…",
  errorGeneric: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
  retry: "पुनः प्रयास करें",
  cancel: "रद्द करें",
  save: "सहेजें",
  delete: "हटाएं",
  confirm: "पुष्टि करें",
  back: "वापस",
  aiGenerated: "AI-निर्मित — सावधानी से समीक्षा करें",
  disclaimer: "यह कानूनी सलाह नहीं है। किसी योग्य पेशेवर से सलाह लें।",
  aiTitle: "AI-सहायित ड्राफ्ट",
  aiGenerateButton: "शिकायत ड्राफ्ट बनाएं",
  aiGenerating: "ड्राफ्ट बना रहे हैं…",
  aiDraftTitle: "शीर्षक",
  aiDraftBody: "ड्राफ्ट",
  aiDraftLegalRefs: "कानूनी संदर्भ",
  aiDraftMissing: "भेजने से पहले जोड़ने के लिए जानकारी",
  aiFallbackLabel: "स्थानीय रूप से तैयार किया गया ड्राफ्ट (AI-निर्मित नहीं)",
  aiNeedsReview:
    "यह ड्राफ्ट एक सहायक है। किसी आधिकारिक तक भेजने से पहले इसे ध्यान से समीक्षा करें।",
  aiCopy: "ड्राफ्ट कॉपी करें",
  aiCopySuccess: "क्लिपबोर्ड पर कॉपी हो गया",
  aiErrorTitle: "ड्राफ्ट नहीं बना सका",
  aiErrorBody:
    "AI सेवा से संपर्क करने में त्रुटि हुई। कृपया पुनः प्रयास करें।",
  aiDraftNotAvailable: "अभी कोई ड्राफ्ट उपलब्ध नहीं है।",
};

export type Locale = "en" | "hi";
export const translations: Record<Locale, TranslationKeys> = { en, hi };
