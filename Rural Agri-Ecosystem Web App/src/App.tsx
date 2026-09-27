import { useState, useEffect, type ReactNode } from "react";
import { isSupabaseConfigured, supabase } from "../../src/lib/supabase";
import { localDb } from "../../src/lib/localDatabase";
import type { Json } from "../../src/types/database.generated";
import {
  fetchProfile,
  updateProfile,
  fetchEquipmentListings,
  createEquipmentListing,
  fetchOwnerEquipmentListings,
  updateEquipmentListing,
  deleteEquipmentListing,
  fetchStorageListings,
  createStorageListing,
  fetchOwnerStorageListings,
  updateStorageListing,
  deleteStorageListing,
  fetchWorkers,
  fetchJobPostings,
  createJobPosting,
  applyForJob,
  fetchWorkerApplications,
  updateJobApplicationStatus,
  createServiceRequest,
  fetchUserRequests,
  updateServiceRequestStatus,
  fetchGovernmentSchemes,
  consultSchemeAdvisor,
  fetchCommunityMessages,
  sendCommunityMessage,
  subscribeToCommunityMessages,
  uploadMedia,
  uploadProfileAvatar,
  removeProfileAvatar,
  updatePersonalizationProfile,
} from "../../src/lib/api";
import { VoiceInputButton } from "../../src/components/VoiceInputButton";

type WeatherState = { temperature: number; description: string; location: string; advice: string } | null;

async function fetchWeatherForPincode(pincode: string): Promise<WeatherState> {
  if (!pincode) return null;
  try {
    const postalResponse = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`);
    const postalData = await postalResponse.json();
    const postal = postalData?.[0]?.PostOffice?.[0];
    if (!postal) return null;
    const search = encodeURIComponent(`${postal.District}, ${postal.State}`);
    const locationResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=1&language=en&format=json`);
    const locationData = await locationResponse.json();
    const location = locationData?.results?.[0];
    if (!location) return null;
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&timezone=auto`);
    const weatherData = await weatherResponse.json();
    const code = weatherData?.current?.weather_code;
    const descriptions: Record<number, string> = { 0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Foggy", 51: "Light drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 80: "Rain showers", 95: "Thunderstorm" };
    return { temperature: Math.round(weatherData.current.temperature_2m), description: descriptions[code] || "Current conditions", location: `${postal.District}, ${postal.State}`, advice: code >= 51 ? "Plan field work around the rain" : "Good conditions for outdoor work" };
  } catch {
    return null;
  }
}

type IconName =
  | "home"
  | "tractor"
  | "users"
  | "warehouse"
  | "leaf"
  | "sun"
  | "cloud"
  | "speaker"
  | "mic"
  | "bell"
  | "map"
  | "phone"
  | "calendar"
  | "clock"
  | "check"
  | "close"
  | "tool"
  | "shield"
  | "briefcase"
  | "user"
  | "chevron"
  | "search"
  | "box";

function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    tractor: <><path d="M4 14h10l-2-6H8v6M14 11h4l3 3v3h-2" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="18" r="2" /><path d="M9 18h6M8 8V5h4" /></>,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-4 2.5-7 6-7s6 3 6 7M15 14c3.5 0 6 2 6 6" /></>,
    warehouse: <><path d="m3 10 9-6 9 6v11H3z" /><path d="M7 21v-7h10v7M7 17h10" /></>,
    leaf: <><path d="M19 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 9-7 9-15Z" /><path d="M5 21c2-6 6-9 11-12" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    cloud: <path d="M6 19h12a4 4 0 0 0 .5-8A7 7 0 0 0 5 9a5 5 0 0 0 1 10Z" />,
    speaker: <><path d="M5 10v4h4l5 4V6L9 10zM17 9c1.5 1.5 1.5 4.5 0 6M19.5 6.5c3 3 3 8 0 11" /></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <path d="M7 3 4 5c-1 1 1 6 5 10s9 6 10 5l2-3-5-3-2 2c-2-1-5-4-6-6l2-2z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m4 12 5 5L20 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    tool: <><path d="M14 7a5 5 0 0 0-7-4l3 3-4 4-3-3a5 5 0 0 0 6 6l7 8 5-5-8-7a5 5 0 0 0 1-2Z" /></>,
    shield: <path d="M12 3 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6z" />,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-5 3-8 8-8s8 3 8 8" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10" /></>,
  };
  return <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">{paths[name]}</svg>;
}

export type LanguageCode = "en" | "hi" | "mr" | "bn" | "te" | "ta" | "gu" | "kn" | "ml" | "pa" | "or" | "as";

const languageOptions: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" }, { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" }, { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" }, { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" }, { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" }, { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ" }, { code: "as", label: "Assamese", nativeLabel: "অসমীয়া" },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  en: { welcome: "WELCOME", signIn: "Sign in to continue", chooseUse: "Choose how you use Kisan Saathi, then enter your mobile number.", mobile: "Mobile number", sendOtp: "Send one-time password", secure: "Your number stays private and secure.", whatNeed: "What do you need?", schemes: "Government schemes", schemesHint: "Suggestions matched to your crops, land, and needs.", apply: "Can I apply?", home: "Home", equipment: "Equipment", jobs: "Jobs", requests: "Requests", profile: "Profile", logout: "Log out", selectLanguage: "Select language", onboarding: "Set up your profile", skip: "Skip for now", continue: "Continue", finish: "Finish setup", back: "Back" },
  hi: { welcome: "स्वागत है", signIn: "जारी रखने के लिए साइन इन करें", chooseUse: "किसान साथी का उपयोग कैसे करेंगे? अपना मोबाइल नंबर दर्ज करें।", mobile: "मोबाइल नंबर", sendOtp: "वन-टाइम पासवर्ड भेजें", secure: "आपका नंबर सुरक्षित और निजी रहेगा।", whatNeed: "आपको क्या चाहिए?", schemes: "सरकारी योजनाएं", schemesHint: "आपकी फसल, जमीन और जरूरतों के आधार पर सुझाव।", apply: "क्या मैं आवेदन कर सकता हूं?", home: "होम", equipment: "उपकरण", jobs: "काम", requests: "अनुरोध", profile: "प्रोफाइल", logout: "लॉग आउट", selectLanguage: "भाषा चुनें", onboarding: "अपनी प्रोफाइल बनाएं", skip: "अभी छोड़ें", continue: "जारी रखें", finish: "सेटअप पूरा करें" },
  mr: { welcome: "स्वागत आहे", signIn: "पुढे जाण्यासाठी साइन इन करा", chooseUse: "किसान साथी कसे वापराल? तुमचा मोबाईल नंबर टाका.", mobile: "मोबाईल नंबर", sendOtp: "वन-टाइम पासवर्ड पाठवा", secure: "तुमचा नंबर सुरक्षित आणि खासगी राहील.", whatNeed: "तुम्हाला काय हवे आहे?", schemes: "सरकारी योजना", schemesHint: "तुमची पिके, जमीन आणि गरजांवर आधारित सूचना.", apply: "मी अर्ज करू शकतो का?", home: "मुख्यपृष्ठ", equipment: "उपकरणे", jobs: "कामे", requests: "विनंत्या", profile: "प्रोफाइल", logout: "लॉग आउट", selectLanguage: "भाषा निवडा", onboarding: "प्रोफाइल तयार करा", skip: "आत्ता वगळा", continue: "पुढे चला", finish: "सेटअप पूर्ण करा" },
  bn: { welcome: "স্বাগতম", signIn: "চালিয়ে যেতে সাইন ইন করুন", chooseUse: "আপনি কিষান সাথী কীভাবে ব্যবহার করবেন? মোবাইল নম্বর দিন।", mobile: "মোবাইল নম্বর", sendOtp: "ওটিপি পাঠান", secure: "আপনার নম্বর নিরাপদ ও গোপন থাকবে।", whatNeed: "আপনার কী প্রয়োজন?", schemes: "সরকারি প্রকল্প", schemesHint: "আপনার ফসল, জমি ও প্রয়োজনের ভিত্তিতে পরামর্শ।", apply: "আমি কি আবেদন করতে পারি?", home: "হোম", equipment: "সরঞ্জাম", jobs: "কাজ", requests: "অনুরোধ", profile: "প্রোফাইল", logout: "লগ আউট", selectLanguage: "ভাষা নির্বাচন করুন", onboarding: "প্রোফাইল তৈরি করুন", skip: "এখন এড়িয়ে যান", continue: "চালিয়ে যান", finish: "সেটআপ শেষ করুন" },
  te: { welcome: "స్వాగతం", signIn: "కొనసాగించడానికి సైన్ ఇన్ చేయండి", chooseUse: "కిసాన్ సాథీని ఎలా ఉపయోగిస్తారు? మొబైల్ నంబర్ నమోదు చేయండి.", mobile: "మొబైల్ నంబర్", sendOtp: "వన్ టైమ్ పాస్‌వర్డ్ పంపండి", secure: "మీ నంబర్ సురక్షితంగా ఉంటుంది.", whatNeed: "మీకు ఏమి కావాలి?", schemes: "ప్రభుత్వ పథకాలు", schemesHint: "మీ పంటలు, భూమి మరియు అవసరాల ఆధారంగా సూచనలు.", apply: "నేను దరఖాస్తు చేయవచ్చా?", home: "హోమ్", equipment: "పరికరాలు", jobs: "పనులు", requests: "అభ్యర్థనలు", profile: "ప్రొఫైల్", logout: "లాగ్ అవుట్", selectLanguage: "భాషను ఎంచుకోండి", onboarding: "మీ ప్రొఫైల్ ఏర్పాటు చేయండి", skip: "ఇప్పుడు దాటవేయండి", continue: "కొనసాగించండి", finish: "సెటప్ పూర్తి చేయండి" },
  ta: { welcome: "வரவேற்கிறோம்", signIn: "தொடர உள்நுழையவும்", chooseUse: "கிசான் சாதியை எப்படிப் பயன்படுத்துவீர்கள்? கைபேசி எண்ணை உள்ளிடவும்.", mobile: "கைபேசி எண்", sendOtp: "ஒருமுறை கடவுச்சொல் அனுப்பவும்", secure: "உங்கள் எண் பாதுகாப்பாக இருக்கும்.", whatNeed: "உங்களுக்கு என்ன தேவை?", schemes: "அரசுத் திட்டங்கள்", schemesHint: "உங்கள் பயிர்கள், நிலம் மற்றும் தேவைகளின் அடிப்படையில் பரிந்துரைகள்.", apply: "நான் விண்ணப்பிக்கலாமா?", canIApply: "நான் இந்த திட்டத்திற்கு விண்ணப்பிக்கலாமா?", weatherTitle: "வானிலை மற்றும் ஆலோசனை", equipmentMarketplace: "கருவிகள் சந்தை", farmJobs: "விவசாய வேலைகள்", storageHub: "பயிர் சேமிப்பு", communityHub: "விவசாயிகள் மன்றம்", aiAdvisor: "ஏஐ திட்ட ஆலோசகர்", home: "முகப்பு", equipment: "கருவிகள்", jobs: "வேலைகள்", requests: "கோரிக்கைகள்", profile: "சுயவிவரம்", logout: "வெளியேறு", selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்", onboarding: "சுயவிவரத்தை அமைக்கவும்", skip: "இப்போது தவிர்க்கவும்", continue: "தொடரவும்", finish: "அமைப்பை முடிக்கவும்", goodMorning: "காலை வணக்கம்", namaste: "வணக்கம்", yourFarmArea: "உங்கள் விவசாயப் பகுதி", connectedLive: "கிசான் சாதியுடன் நேரலையில் இணைக்கப்பட்டுள்ளது.", addValidPincode: "உள்ளூர் வானிலையைப் பார்க்க பின்கோடைச் சேர்க்கவும்.", bookTractor: "டிராக்டர் முன்பதிவு", findLabor: "வேலையாட்களைக் கண்டறியவும்", findStorage: "சேமிப்பைக் கண்டறியவும்", bookedServices: "முன்பதிவு செய்யப்பட்ட சேவைகள்", viewAll: "அனைத்தையும் பார்", noBookedServices: "உங்களிடம் முன்பதிவு செய்யப்பட்ட சேவைகள் எதுவுமில்லை.", villageVoices: "கிராமக் குரல்கள் & மன்றம்", communityDiscussions: "சமூக விவாதங்கள்", noMessagesYet: "செய்திகள் எதுவும் இல்லை. முதலில் பதிவிடவும்!", shareTip: "விவசாய குறிப்பைப் பகிரவும்...", postBtn: "பதிவிடு", todayWeather: "இன்றைய வானிலை" },
  gu: { welcome: "સ્વાગત છે", signIn: "ચાલુ રાખવા માટે સાઇન ઇન કરો", chooseUse: "કિસાન સાથીનો ઉપયોગ કેવી રીતે કરશો? મોબાઇલ નંબર દાખલ કરો.", mobile: "મોબાઇલ નંબર", sendOtp: "વન-ટાઇમ પાસવર્ડ મોકલો", secure: "તમારો નંબર સુરક્ષિત અને ખાનગી રહેશે.", whatNeed: "તમને શું જોઈએ છે?", schemes: "સરકારી યોજનાઓ", schemesHint: "તમારા પાક, જમીન અને જરૂરિયાતો પર આધારિત સૂચનો.", apply: "શું હું અરજી કરી શકું?", home: "હોમ", equipment: "સાધનો", jobs: "કામ", requests: "વિનંતીઓ", profile: "પ્રોફાઇલ", logout: "લૉગ આઉટ", selectLanguage: "ભાષા પસંદ કરો", onboarding: "તમારી પ્રોફાઇલ સેટ કરો", skip: "હમણાં છોડો", continue: "ચાલુ રાખો", finish: "સેટઅપ પૂર્ણ કરો" },
  kn: { welcome: "ಸ್ವಾಗತ", signIn: "ಮುಂದುವರಿಯಲು ಸೈನ್ ಇನ್ ಮಾಡಿ", chooseUse: "ಕಿಸಾನ್ ಸಾಥಿಯನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ? ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.", mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", sendOtp: "ಒಟಿಪಿ ಕಳುಹಿಸಿ", secure: "ನಿಮ್ಮ ಸಂಖ್ಯೆ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.", whatNeed: "ನಿಮಗೆ ಏನು ಬೇಕು?", schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", schemesHint: "ನಿಮ್ಮ ಬೆಳೆಗಳು, ಭೂಮಿ ಮತ್ತು ಅಗತ್ಯಗಳ ಆಧಾರದ ಸಲಹೆಗಳು.", apply: "ನಾನು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದೇ?", home: "ಮುಖಪುಟ", equipment: "ಉಪಕರಣಗಳು", jobs: "ಕೆಲಸಗಳು", requests: "ವಿನಂತಿಗಳು", profile: "ಪ್ರೊಫೈಲ್", logout: "ಲಾಗ್ ಔಟ್", selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ", onboarding: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಹೊಂದಿಸಿ", skip: "ಈಗ ಬಿಟ್ಟುಬಿಡಿ", continue: "ಮುಂದುವರಿಸಿ", finish: "ಸೆಟಪ್ ಮುಗಿಸಿ" },
  ml: { welcome: "സ്വാഗതം", signIn: "തുടരാൻ സൈൻ ഇൻ ചെയ്യുക", chooseUse: "കിസാൻ സാഥി എങ്ങനെ ഉപയോഗിക്കും? മൊബൈൽ നമ്പർ നൽകുക.", mobile: "മൊബൈൽ നമ്പർ", sendOtp: "ഒടിപി അയയ്ക്കുക", secure: "നിങ്ങളുടെ നമ്പർ സുരക്ഷിതമായിരിക്കും.", whatNeed: "നിങ്ങൾക്ക് എന്താണ് വേണ്ടത്?", schemes: "സർക്കാർ പദ്ധതികൾ", schemesHint: "നിങ്ങളുടെ വിളകൾ, ഭൂമി, ആവശ്യങ്ങൾ എന്നിവ അടിസ്ഥാനമാക്കിയുള്ള നിർദ്ദേശങ്ങൾ.", apply: "എനിക്ക് അപേക്ഷിക്കാമോ?", canIApply: "എനിക്ക് ഇതിന് അപേക്ഷിക്കാമോ?", weatherTitle: "കാലാവസ്ഥയും വിവരങ്ങളും", equipmentMarketplace: "ഉപകരണ വിപണി", farmJobs: "തൊഴിൽ അവസരങ്ങൾ", storageHub: "വിള സംഭരണം", communityHub: "കർഷക കൂട്ടായ്മ", aiAdvisor: "എഐ സ്കീം അഡ്വൈസർ", home: "ഹോം", equipment: "ഉപകരണങ്ങൾ", jobs: "ജോലികൾ", requests: "അഭ്യർത്ഥനകൾ", profile: "പ്രൊഫൈൽ", logout: "ലോഗ് ഔട്ട്", selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക", onboarding: "പ്രൊഫൈൽ സജ്ജമാക്കുക", skip: "ഇപ്പോൾ ഒഴിവാക്കുക", continue: "തുടരുക", finish: "സജ്ജീകരണം പൂർത്തിയാക്കുക", goodMorning: "സുപ്രഭാതം", namaste: "നമസ്കാരം", yourFarmArea: "നിങ്ങളുടെ കാർഷിക മേഖല", connectedLive: "കിസാൻ സാഥിയുമായി തത്സമയം ബന്ധിപ്പിച്ചിരിക്കുന്നു.", addValidPincode: "പ്രാദേശിക കാലാവസ്ഥ കാണാൻ പിൻകോഡ് നൽകുക.", bookTractor: "ട്രാക്ടർ ബുക്ക് ചെയ്യുക", findLabor: "തൊഴിലാളികളെ കണ്ടെത്തുക", findStorage: "സംഭരണം കണ്ടെത്തുക", bookedServices: "ബുക്ക് ചെയ്ത സേവനങ്ങൾ", viewAll: "എല്ലാം കാണുക", noBookedServices: "നിങ്ങൾക്ക് ഇതുവരെ ബുക്ക് ചെയ്ത സേവനങ്ങളൊന്നുമില്ല.", villageVoices: "ഗ്രാമ ശബ്ദങ്ങളും ഫോറവും", communityDiscussions: "കമ്മ്യൂണിറ്റി ചർച്ചകൾ", noMessagesYet: "സന്ദേശങ്ങളൊന്നുമില്ല. ആദ്യം പോസ്റ്റ് ചെയ്യൂ!", shareTip: "കൃഷി ടിപ്പ് പങ്കിടുക...", postBtn: "പോസ്റ്റ് ചെയ്യുക", todayWeather: "ഇന്നത്തെ കാലാവസ്ഥ" },
  pa: { welcome: "ਜੀ ਆਇਆਂ ਨੂੰ", signIn: "ਜਾਰੀ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ", chooseUse: "ਤੁਸੀਂ ਕਿਸਾਨ ਸਾਥੀ ਨੂੰ ਕਿਵੇਂ ਵਰਤੋਗੇ? ਮੋਬਾਈਲ ਨੰਬਰ ਦਿਓ।", mobile: "ਮੋਬਾਈਲ ਨੰਬਰ", sendOtp: "ਓਟੀਪੀ ਭੇਜੋ", secure: "ਤੁਹਾਡਾ ਨੰਬਰ ਸੁਰੱਖਿਅਤ ਰਹੇਗਾ।", whatNeed: "ਤੁਹਾਨੂੰ ਕੀ ਚਾਹੀਦਾ ਹੈ?", schemes: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ", schemesHint: "ਤੁਹਾਡੀਆਂ ਫਸਲਾਂ, ਜ਼ਮੀਨ ਅਤੇ ਲੋੜਾਂ ਦੇ ਆਧਾਰ ਤੇ ਸੁਝਾਅ।", apply: "ਕੀ ਮੈਂ ਅਰਜ਼ੀ ਦੇ ਸਕਦਾ ਹਾਂ?", home: "ਘਰ", equipment: "ਸਾਜ਼ੋ-ਸਾਮਾਨ", jobs: "ਕੰਮ", requests: "ਬੇਨਤੀਆਂ", profile: "ਪ੍ਰੋਫਾਈਲ", logout: "ਲੌਗ ਆਊਟ", selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ", onboarding: "ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ", skip: "ਹੁਣੇ ਛੱਡੋ", continue: "ਜਾਰੀ ਰੱਖੋ", finish: "ਸੈੱਟਅੱਪ ਪੂਰਾ ਕਰੋ" },
  or: { welcome: "ସ୍ୱାଗତ", signIn: "ଜାରି ରଖିବାକୁ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ", chooseUse: "ଆପଣ କିସାନ ସାଥୀକୁ କିପରି ବ୍ୟବହାର କରିବେ? ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ।", mobile: "ମୋବାଇଲ୍ ନମ୍ବର", sendOtp: "ଓଟିପି ପଠାନ୍ତୁ", secure: "ଆପଣଙ୍କ ନମ୍ବର ସୁରକ୍ଷିତ ରହିବ।", whatNeed: "ଆପଣଙ୍କର କଣ ଦରକାର?", schemes: "ସରକାରୀ ଯୋଜନା", schemesHint: "ଆପଣଙ୍କ ଫସଲ, ଜମି ଓ ଆବଶ୍ୟକତା ଆଧାରିତ ପରାମର୍ଶ।", apply: "ମୁଁ ଆବେଦନ କରିପାରିବି କି?", home: "ହୋମ୍", equipment: "ଉପକରଣ", jobs: "କାମ", requests: "ଅନୁରୋଧ", profile: "ପ୍ରୋଫାଇଲ୍", logout: "ଲଗ୍ ଆଉଟ୍", selectLanguage: "ଭାଷା ବାଛନ୍ତୁ", onboarding: "ପ୍ରୋଫାଇଲ୍ ସେଟ୍ କରନ୍ତୁ", skip: "ବର୍ତ୍ତମାନ ଛାଡନ୍ତୁ", continue: "ଜାରି ରଖନ୍ତୁ", finish: "ସେଟଅପ୍ ସମାପ୍ତ କରନ୍ତୁ" },
  as: { welcome: "স্বাগতম", signIn: "আগবাঢ়িবলৈ ছাইন ইন কৰক", chooseUse: "আপুনি কিষাণ সাথী কেনেকৈ ব্যৱহাৰ কৰিব? মোবাইল নম্বৰ দিয়ক।", mobile: "মোবাইল নম্বৰ", sendOtp: "ওটিপি পঠিয়াওক", secure: "আপোনাৰ নম্বৰ সুৰক্ষিত থাকিব।", whatNeed: "আপোনাক কি লাগে?", schemes: "চৰকাৰী আঁচনি", schemesHint: "আপোনাৰ শস্য, মাটি আৰু প্ৰয়োজনৰ ওপৰত ভিত্তি কৰি পৰামৰ্শ।", apply: "মই আবেদন কৰিব পাৰোঁনে?", home: "হোম", equipment: "সঁজুলি", jobs: "কাম", requests: "অনুৰোধ", profile: "প্ৰফাইল", logout: "লগ আউট", selectLanguage: "ভাষা বাছক", onboarding: "আপোনাৰ প্ৰফাইল সাজু কৰক", skip: "এতিয়া বাদ দিয়ক", continue: "আগবাঢ়ক", finish: "ছেটআপ সম্পূৰ্ণ কৰক" },
};

function text(language: LanguageCode, key: string) {
  if (key === "workers") return ({ en: "Workers", hi: "श्रमिक", mr: "मजूर", bn: "শ্রমিক", te: "కార్మికులు", ta: "தொழிலாளர்கள்", gu: "મજૂરો", kn: "ಕಾರ್ಮಿಕರು", ml: "തൊഴിലാളികൾ", pa: "ਮਜ਼ਦੂਰ", or: "ଶ୍ରମିକ", as: "শ্ৰমিক" } as Record<string, string>)[language] || "Workers";
  const langObj = translations[language] || translations.en || {};
  return langObj[key] || translations.en?.[key] || key;
}

function LanguageSelect({ language, onChange }: { language: LanguageCode; onChange: (language: LanguageCode) => void }) {
  return <label className="language-select"><span className="language-symbol">अ</span><span className="visually-hidden">{text(language, "selectLanguage")}</span><select aria-label={text(language, "selectLanguage")} value={language} onChange={event => onChange(event.target.value as LanguageCode)}>{languageOptions.map(option => <option value={option.code} key={option.code}>{option.nativeLabel} / {option.label}</option>)}</select><Icon name="chevron" size={16} /></label>;
}

const photos = {
  farmer: "https://images.unsplash.com/photo-1627475320102-d73fcb4eb427?auto=format&fit=crop&w=500&q=85",
  tractor: "https://images.unsplash.com/photo-1564868480822-32f714a0e763?auto=format&fit=crop&w=800&q=85",
  redTractor: "https://images.unsplash.com/photo-1606739211185-2c846d734a6d?auto=format&fit=crop&w=800&q=85",
  harvester: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=800&q=85",
  rotavator: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=85",
  sprayer: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=85",
  thresher: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=85",
  waterPump: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=85",
  workers: "https://images.unsplash.com/photo-1760973177205-2d27e31f9afa?auto=format&fit=crop&w=800&q=85",
  coldStorage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85",
  warehouse: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=85",
  silo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85",
  onionStorage: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=85",
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export type UserRole = "Farmer" | "Tool Lender" | "Job Seeker" | "Storage Owner";

const roleMap: Record<UserRole, 'farmer' | 'tool_lender' | 'job_seeker' | 'storage_owner'> = {
  "Farmer": "farmer",
  "Tool Lender": "tool_lender",
  "Job Seeker": "job_seeker",
  "Storage Owner": "storage_owner",
};

const reverseRoleMap: Record<string, UserRole> = {
  farmer: "Farmer",
  tool_lender: "Tool Lender",
  job_seeker: "Job Seeker",
  storage_owner: "Storage Owner",
  "Farmer": "Farmer",
  "Tool Lender": "Tool Lender",
  "Job Seeker": "Job Seeker",
  "Storage Owner": "Storage Owner",
};

export function normalizeRole(roleStr?: string | null): UserRole {
  if (!roleStr) return "Farmer";
  const s = String(roleStr).toLowerCase().replace(/[\s_-]+/g, "");
  if (s.includes("lender") || s.includes("tool") || s.includes("machin") || s.includes("equip")) return "Tool Lender";
  if (s.includes("job") || s.includes("seek") || s.includes("labour") || s.includes("labor") || s.includes("worker")) return "Job Seeker";
  if (s.includes("storage") || s.includes("ware") || s.includes("cold") || s.includes("silo")) return "Storage Owner";
  return "Farmer";
}

export function formatE164Phone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

function SpeakButton({ text, label, language = "en", hidden = false, compact = true }: { text?: string; label: string; language?: string; hidden?: boolean; compact?: boolean }) {
  if (hidden) return null;
  return <RealSpeakButton text={text || label} language={language} label={label} compact={compact} />;
}

function SectionTitle({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return <div className="section-title"><h2>{children}</h2>{action && <button onClick={onAction}>{action} <Icon name="chevron" size={18} /></button>}</div>;
}

export type OnboardingProfile = {
  role: UserRole;
  answers: Record<number, string[]>;
  account?: SignupForm;
  userId?: string;
  dbProfile?: any;
};

export type SignupForm = {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  place: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  firstName?: string;
  lastName?: string;
  city?: string;
};

const roleValues: Record<UserRole, 'farmer' | 'tool_lender' | 'job_seeker' | 'storage_owner'> = {
  Farmer: "farmer",
  "Tool Lender": "tool_lender",
  "Job Seeker": "job_seeker",
  "Storage Owner": "storage_owner",
};

const displayRoles: Record<string, UserRole> = {
  farmer: "Farmer",
  tool_lender: "Tool Lender",
  job_seeker: "Job Seeker",
  storage_owner: "Storage Owner",
};

function toAuthPhone(phone: string) {
  return `+91${phone}`;
}

function Dashboard({ notify, go, profile, language }: { notify: (message: string) => void; go: (page: string) => void; profile: OnboardingProfile; language: LanguageCode }) {
  const [weather, setWeather] = useState<WeatherState>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [storageList, setStorageList] = useState<any[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  useEffect(() => {
    let mounted = true;
    void fetchWeatherForPincode(profile.account?.pincode || "").then(result => { if (mounted) setWeather(result); }).catch(() => { if (mounted) setWeather(null); });
    const userId = profile.userId || profile.dbProfile?.id;
    if (isSupabaseConfigured && userId) {
      void supabase.from("service_requests").select("*").eq("requester_id", userId).order("created_at", { ascending: false }).then(({ data }) => { if (mounted) setBookings(data || []); });
    } else if (userId) {
      setBookings(localDb.getUserRequests(userId));
    }
    return () => { mounted = false; };
  }, [profile.account?.pincode, profile.userId, profile.dbProfile?.id]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchEquipmentListings().catch(() => localDb.getEquipmentListings()),
      fetchWorkers().catch(() => localDb.getWorkers()),
      fetchStorageListings().catch(() => localDb.getStorageListings()),
    ]).then(([eq, wk, st]) => {
      if (mounted) {
        setEquipmentList(eq && eq.length > 0 ? eq : localDb.getEquipmentListings());
        setWorkersList(wk && wk.length > 0 ? wk : localDb.getWorkers());
        setStorageList(st && st.length > 0 ? st : localDb.getStorageListings());
        setLoadingFeeds(false);
      }
    }).catch(() => {
      if (mounted) {
        setEquipmentList(localDb.getEquipmentListings());
        setWorkersList(localDb.getWorkers());
        setStorageList(localDb.getStorageListings());
        setLoadingFeeds(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    fetchCommunityMessages('general').then(setMessages).catch(() => { });
    const sub = subscribeToCommunityMessages('general', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleSendMessage = async () => {
    const senderId = profile.userId || profile.dbProfile?.id;
    if (!newMsg.trim() || !senderId) return;
    try {
      await sendCommunityMessage(senderId, 'general', newMsg.trim());
      setNewMsg("");
      notify("Message posted to village voices!");
    } catch (err: any) {
      notify(`Failed to send: ${err.message}`);
    }
  };

  const quick = [
    { label: "Book Tractor", icon: "tractor" as IconName, color: "green", page: "market" },
    { label: "Find Labor", icon: "users" as IconName, color: "gold", page: profile.role === "Farmer" ? "workers" : "jobs" },
    { label: "Find Storage", icon: "warehouse" as IconName, color: "blue", page: "market" },
    { label: "Government schemes", icon: "shield" as IconName, color: "purple", page: "schemes" },
  ];

  const displayName = profile.account?.firstName || profile.dbProfile?.full_name?.split(" ")[0] || "Farmer";

  return <main className="page-content">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">{text(language, "goodMorning")}</div>
        <h1>{text(language, "namaste")}, {displayName}!</h1>
        <p>{profile.account?.city && profile.account.state ? `${profile.account.city}, ${profile.account.state}` : text(language, "yourFarmArea")} {text(language, "connectedLive")}</p>
      </div>
      <img src={photos.farmer} alt="Farmer standing in a green field" />
    </section>

    <section className="weather-card">
      {weather ? <><div className="weather-main"><div className="sun-icon"><Icon name="sun" size={34} /></div><div><strong>{weather.temperature}°</strong><span>{weather.description}</span></div></div><div className="weather-place"><Icon name="map" size={18} /><span>{weather.location}<br /><b>{weather.advice}</b></span></div></> : <div className="weather-unavailable"><Icon name="cloud" size={25} /><span>{text(language, "addValidPincode")}</span></div>}
      <SpeakButton label="today's weather" />
    </section>

    <SectionTitle>{text(language, "whatNeed")}</SectionTitle>
    <div className="quick-grid">
      {quick.map(item => <button className={`quick-card ${item.color}`} key={item.label} onClick={() => go(item.page)}>
        <span className="quick-icon"><Icon name={item.icon} size={35} /></span>
        <strong>{item.label}</strong><Icon name="chevron" size={20} />
      </button>)}
    </div>

    {/* 1. LIVE MACHINERY & EQUIPMENT FROM TOOL LENDERS */}
    <SectionTitle action="View All Tools" onAction={() => go("market")}>
      🚜 Equipment & Machinery Near You
    </SectionTitle>
    {equipmentList.length === 0 ? (
      <p className="empty-state">No equipment listed right now. Local lenders will list tractors and implements here.</p>
    ) : (
      <div className="catalog-grid" style={{ marginBottom: "28px" }}>
        {equipmentList.slice(0, 3).map((item) => (
          <article className="equipment-card" key={item.id}>
            <div className="equipment-photo">
              <img src={item.images?.[0] || photos.tractor} alt={item.title} />
              <span className={`availability ${item.is_available ? "" : "busy"}`}>
                {item.is_available ? "Available" : "In use"}
              </span>
            </div>
            <div className="equipment-content">
              <div className="equipment-title">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.category} • Owner: {item.owner?.full_name || "Local Provider"}</p>
                </div>
              </div>
              <div className="price-line">
                <div>
                  <strong>₹{item.daily_rate}</strong>
                  <span>/ day</span>
                </div>
                {item.hourly_rate && (
                  <span style={{ fontSize: "12px", color: "#668073", fontWeight: 700 }}>
                    (₹{item.hourly_rate}/hr)
                  </span>
                )}
              </div>
              <div className="action-row">
                <button
                  className="book-btn"
                  onClick={() => go("market")}
                >
                  <Icon name="calendar" size={16} /> Book Tractor / Tool
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}

    {/* 2. LIVE WORKERS FROM JOB SEEKERS */}
    <SectionTitle action="Find All Workers" onAction={() => go("workers")}>
      👷 Available Farm Workers & Labourers
    </SectionTitle>
    {workersList.length === 0 ? (
      <p className="empty-state">No agricultural workers available right now. Job seekers will appear here.</p>
    ) : (
      <div className="jobs-list" style={{ marginBottom: "28px" }}>
        {workersList.slice(0, 2).map((worker) => {
          const skills = worker.metadata?.skills || worker.work_skills || ["Paddy Harvesting", "Transplantation"];
          const dailyWage = worker.metadata?.daily_wage || worker.daily_rate || 700;
          return (
            <article className="job-card" key={worker.id} style={{ display: "flex", gap: "16px", padding: "16px", alignItems: "flex-start" }}>
              <div style={{ width: "56px", height: "56px", minWidth: "56px", borderRadius: "50%", overflow: "hidden", border: "2px solid #16a34a" }}>
                <img
                  src={worker.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"}
                  alt={worker.full_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="job-info" style={{ flex: 1 }}>
                <div className="job-top">
                  <span className="status live">{worker.metadata?.status || "🟢 Available Today"}</span>
                  <strong style={{ color: "#15803d", fontSize: "1.05rem" }}>₹{dailyWage}/day</strong>
                </div>
                <h3 style={{ margin: "2px 0 4px", fontSize: "1.1rem" }}>{worker.full_name}</h3>
                <p className="farm-name" style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "#4b5563" }}>
                  📍 {worker.location?.district || "Palakkad, Kerala"} • 🚶 {worker.metadata?.travel_distance || "Within 15 km"}
                </p>
                <div className="tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                  {skills.slice(0, 3).map((skill: string) => (
                    <span key={skill} style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                      ✓ {skill}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{worker.phone || "+91 9876543211"}</span>
                  <button
                    className="primary-action"
                    style={{ width: "auto", margin: 0, padding: "6px 14px", minHeight: "34px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}
                    onClick={() => notify(`Calling ${worker.full_name} at ${worker.phone || "+91 9876543211"}`)}
                  >
                    <Icon name="phone" size={14} /> Contact Worker
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    )}

    {/* 3. LIVE STORAGE FACILITIES FROM STORAGE OWNERS */}
    <SectionTitle action="View All Storage" onAction={() => go("farmer_storage")}>
      🏭 Cold Storage & Warehouses Near You
    </SectionTitle>
    {storageList.length === 0 ? (
      <p className="empty-state">No storage facilities registered in your area yet.</p>
    ) : (
      <div className="catalog-grid" style={{ marginBottom: "28px" }}>
        {storageList.slice(0, 3).map((item) => (
          <article className="equipment-card" key={item.id}>
            <div className="equipment-photo">
              <img src={item.images?.[0] || photos.warehouse} alt={item.name} />
              <span className="availability">🟢 {item.storage_type}</span>
            </div>
            <div className="equipment-content">
              <div className="equipment-title">
                <div>
                  <h3>{item.name}</h3>
                  <p>📍 {item.location_address || "Local Agri Hub"}</p>
                </div>
              </div>
              <div className="capacity-meter" style={{ margin: "8px 0" }}>
                <div className="capacity-track">
                  <div className="capacity-fill" style={{ width: "35%" }} />
                </div>
                <div className="capacity-labels" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "4px" }}>
                  <strong style={{ color: "#168642" }}>{item.available_capacity_tons} Tons Space Free</strong>
                  <span>Total {item.total_capacity_tons} Tons</span>
                </div>
              </div>
              <div className="price-line">
                <div>
                  <strong>₹{item.rate_per_ton_day}</strong>
                  <span>/ ton / day</span>
                </div>
              </div>
              <div className="action-row" style={{ marginTop: "10px" }}>
                <button
                  className="book-btn"
                  onClick={() => go("farmer_storage")}
                >
                  <Icon name="warehouse" size={16} /> Reserve Storage Space
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}

    <SectionTitle action={text(language, "viewAll")} onAction={() => go("requests")}>{text(language, "bookedServices")}</SectionTitle>
    {bookings.length === 0 ? <p className="empty-state">{text(language, "noBookedServices")}</p> : bookings.map(booking => <section className="request-card" key={booking.id}><div className="request-top"><span className="request-image"><Icon name={booking.item_type === "storage" ? "warehouse" : "tractor"} size={30} /></span><div><span className={`status ${booking.status === "confirmed" ? "live" : "pending"}`}>{booking.status}</span><h3>{booking.item_type === "storage" ? "Storage booking" : "Equipment booking"}</h3><p><Icon name="calendar" size={16} /> {booking.start_date || "Date pending"}</p></div></div></section>)}

    <SectionTitle action={text(language, "community")} onAction={() => go("community")}>{text(language, "villageVoices")}</SectionTitle>
    <section className="voice-card">
      <div>
        <span className="status live">Live Feed</span>
        <h3>{text(language, "communityDiscussions")}</h3>
        <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
          {messages.length === 0 ? <p>{text(language, "noMessagesYet")}</p> : messages.slice(-3).map((m, i) => (
            <div key={m.id || i} style={{ fontSize: '0.85rem', margin: '4px 0' }}>
              <b>{m.sender?.full_name || 'Neighbor'}:</b> {m.content}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            placeholder={text(language, "shareTip")}
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <VoiceInputButton
            context="community_post"
            appLanguage={language}
            onPopulate={(fields) => {
              if (fields.content) setNewMsg(fields.content);
            }}
            label="Speak Tip"
          />
          <button className="primary-action" style={{ width: 'auto', padding: '0 12px' }} onClick={handleSendMessage}>{text(language, "postBtn")}</button>
        </div>
      </div>
    </section>

  </main>;
}

const OFFICIAL_GOVERNMENT_SCHEMES = [
  {
    id: "scheme-pmkisan",
    title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    category: "Income Support",
    description: "Provides direct income support of ₹6,000 per year to all landholding farmer families across India, transferred directly to Aadhaar-linked bank accounts in 3 equal installments.",
    benefits: "₹6,000 per year directly transferred to verified bank account (3 installments of ₹2,000 every 4 months).",
    official_link: "https://pmkisan.gov.in",
    eligibility_criteria: {
      roles: ["farmer"],
      target_groups: ["Small & Marginal Farmers", "All Landholding Farmer Families"],
      documents: ["Aadhaar Card", "Land Ownership Record / Khasra-Khatauni", "Bank Passbook"],
      how_to_apply: "Apply online at pmkisan.gov.in under 'New Farmer Registration' or visit the nearest CSC (Common Service Centre)."
    }
  },
  {
    id: "scheme-pmfby",
    title: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    category: "Crop Insurance",
    description: "Comprehensive yield-based and weather-based crop insurance scheme covering non-preventable natural risks from pre-sowing to post-harvest.",
    benefits: "Farmer premium capped at 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops with 100% loss coverage subsidized by Central & State Govts.",
    official_link: "https://pmfby.gov.in",
    eligibility_criteria: {
      roles: ["farmer"],
      crops: ["Food crops (cereals/pulses)", "Oilseeds", "Commercial & Horticultural crops"],
      documents: ["Land Possession Certificate / Sowing Certificate", "Aadhaar Card", "Bank Account Details"],
      how_to_apply: "Enroll through national crop insurance portal pmfby.gov.in, designated banks, or insurance intermediaries before cutoff dates."
    }
  },
  {
    id: "scheme-kcc",
    title: "KCC (Kisan Credit Card Scheme)",
    category: "Credit & Loans",
    description: "Provides hassle-free, timely credit to farmers, animal husbandry rearers, and fisheries farmers for crop cultivation, post-harvest expenses, and farm maintenance.",
    benefits: "Revolving credit limit up to ₹3 Lakhs at 7% interest rate, subsidized down to 4% effective interest rate with prompt repayment incentive.",
    official_link: "https://myscheme.gov.in/schemes/kcc",
    eligibility_criteria: {
      roles: ["farmer", "tool_lender", "job_seeker"],
      target_groups: ["Individual Farmers", "Joint Borrowers", "Tenant Farmers", "Sharecroppers", "SHGs"],
      documents: ["Land Documents / Lease Deed", "Aadhaar Card", "PAN Card", "Passport Photo"],
      how_to_apply: "Submit KCC application at any commercial bank, RRB, or Cooperative Bank branch along with land records."
    }
  },
  {
    id: "scheme-smam",
    title: "SMAM (Sub-Mission on Agricultural Mechanization)",
    category: "Mechanization",
    description: "Promotes farm mechanization for small & marginal farmers and supports setup of Custom Hiring Centres (CHCs) and Farm Machinery Banks.",
    benefits: "40% to 80% subsidy on purchase of tractors, rotavators, power tillers, combine harvesters, and establishment of Custom Hiring Centres up to ₹10 Lakhs.",
    official_link: "https://agrimachinery.nic.in",
    eligibility_criteria: {
      roles: ["farmer", "tool_lender"],
      target_groups: ["Small & Marginal Farmers", "Women Farmers", "SC/ST Farmers", "Custom Hiring Entrepreneurs"],
      documents: ["Aadhaar", "Land Records", "Bank Details", "Dealer Quotation for Equipment"],
      how_to_apply: "Register on agrimachinery.nic.in Direct Benefit Transfer portal, choose equipment & dealer, and submit subsidy application online."
    }
  },
  {
    id: "scheme-aif",
    title: "AIF (Agriculture Infrastructure Fund)",
    category: "Infrastructure",
    description: "Medium to long-term debt financing facility for investment in post-harvest management infrastructure and community farming assets like cold storage, warehouses, and processing units.",
    benefits: "3% per annum interest subvention on loans up to ₹2 Crores for up to 7 years, with CGTMSE credit guarantee coverage.",
    official_link: "https://agriinfra.dac.gov.in",
    eligibility_criteria: {
      roles: ["farmer", "storage_owner", "tool_lender"],
      target_groups: ["Agri-Entrepreneurs", "Startups", "PACS", "FPOs", "Storage Owners"],
      documents: ["Detailed Project Report (DPR)", "Land Ownership / Lease Agreement", "GST & Bank Statements"],
      how_to_apply: "Apply online at agriinfra.dac.gov.in portal by registering your project and selecting participating financial institutions."
    }
  },
  {
    id: "scheme-pmksy",
    title: "PMKSY (Pradhan Mantri Krishi Sinchayee Yojana - Per Drop More Crop)",
    category: "Solar & Irrigation",
    description: "Promotes micro-irrigation systems (drip and sprinkler irrigation) to enhance water use efficiency, crop yield, and farm productivity.",
    benefits: "55% subsidy for small & marginal farmers and 45% subsidy for other farmers on micro-irrigation (drip/sprinkler) equipment installation.",
    official_link: "https://pmksy.gov.in",
    eligibility_criteria: {
      roles: ["farmer"],
      target_groups: ["All farmers with verified water source and land title"],
      documents: ["Aadhaar Card", "Land Certificate", "Water Source / Electricity Proof"],
      how_to_apply: "Apply through District Agriculture / Horticulture Officer or designated state micro-irrigation portal."
    }
  },
  {
    id: "scheme-pmkusum",
    title: "PM-KUSUM (Solar Pump & Solar Power Scheme)",
    category: "Solar & Irrigation",
    description: "Subsidy scheme to install off-grid solar water pumps, solarize existing grid-connected agricultural pumps, and set up solar power plants on barren farm lands.",
    benefits: "60% total financial subsidy (30% Central + 30% State) for solar pumps + 30% bank loan option (farmers pay only 10% upfront). Surplus power can be sold back to DISCOM grid.",
    official_link: "https://mnre.gov.in/solar-schemes/pm-kusum",
    eligibility_criteria: {
      roles: ["farmer", "tool_lender", "storage_owner"],
      target_groups: ["Individual Farmers", "Water User Associations", "Panchayats", "Cooperatives"],
      documents: ["Aadhaar Card", "Land Ownership Record", "Bank Passbook", "Latest Electricity Bill"],
      how_to_apply: "Apply via state renewable energy development agency (SREDA) portal or official MNRE PM-KUSUM portal."
    }
  },
  {
    id: "scheme-pkvy",
    title: "PKVY (Paramparagat Krishi Vikas Yojana)",
    category: "Organic & Soil",
    description: "Promotes cluster-based organic farming and Participatory Guarantee System (PGS) certification to encourage chemical-free farming and sustainable soil health.",
    benefits: "Financial assistance of ₹50,000 per hectare over 3 years (₹31,000 transferred directly for organic inputs like bio-fertilizers, neem cake, and organic seeds).",
    official_link: "https://pgsindia-ncof.gov.in",
    eligibility_criteria: {
      roles: ["farmer"],
      target_groups: ["Farmer clusters of 20 or more farmers (50 acre cluster)"],
      documents: ["Aadhaar Card", "Land Records", "Cluster Group Formation Agreement"],
      how_to_apply: "Register your farmer cluster through Regional Council or District Agriculture Department on pgsindia-ncof.gov.in."
    }
  },
  {
    id: "scheme-soilhealth",
    title: "Soil Health Card Scheme",
    category: "Organic & Soil",
    description: "Provides farmers with customized soil test cards analyzing 12 key nutrient parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) along with fertilizer recommendation advice.",
    benefits: "Free comprehensive soil health testing and customized crop-wise fertilizer dosage recommendations issued every 3 years.",
    official_link: "https://soilhealth.dac.gov.in",
    eligibility_criteria: {
      roles: ["farmer"],
      target_groups: ["All Landholding Farmers"],
      documents: ["Soil Sample Submission", "Aadhaar Card", "Mobile Number"],
      how_to_apply: "Submit soil sample to local Soil Testing Laboratory or Krishi Vigyan Kendra (KVK)."
    }
  },
  {
    id: "scheme-enam",
    title: "eNAM (National Agriculture Market)",
    category: "Marketing",
    description: "Pan-India electronic trading portal networking existing APMC mandis to create a unified national market for agricultural commodities.",
    benefits: "Direct online trading of produce across state lines, transparent price discovery, real-time online bidding, and direct online payment into farmer bank accounts.",
    official_link: "https://enam.gov.in",
    eligibility_criteria: {
      roles: ["farmer", "tool_lender", "storage_owner"],
      target_groups: ["Farmers", "Traders", "Commission Agents", "FPOs"],
      documents: ["Aadhaar Card", "Bank Account Details", "Mandi Passbook"],
      how_to_apply: "Register as farmer on enam.gov.in mobile app or visit your nearest eNAM-linked APMC mandi."
    }
  },
  {
    id: "scheme-rkvy",
    title: "RKVY-RAFTAAR (Rashtriya Krishi Vikas Yojana)",
    category: "Infrastructure",
    description: "Funding and incubation support for agri-startups, rural youth innovation, value addition, and agricultural business development.",
    benefits: "Grant-in-aid funding up to ₹5 Lakhs for pre-idea stage and up to ₹25 Lakhs for seed stage agri-enterprises and innovation projects.",
    official_link: "https://rkvy.nic.in",
    eligibility_criteria: {
      roles: ["farmer", "job_seeker", "tool_lender", "storage_owner"],
      target_groups: ["Rural Youth", "Agri Graduates", "Farmers", "Agri-Startups"],
      documents: ["Agri Business Proposal / Business Plan", "Aadhaar", "PAN Card", "Bank Details"],
      how_to_apply: "Apply during call for applications through designated RKVY Agribusiness Incubators (R-ABIs)."
    }
  },
  {
    id: "scheme-pmmsy",
    title: "PMMSY (Pradhan Mantri Matsya Sampada Yojana)",
    category: "Income Support",
    description: "Scheme for sustainable development of fisheries sector, aquaculture infrastructure, fish farming equipment, and fisher welfare.",
    benefits: "40% financial subsidy for general category and 60% for SC/ST/Women beneficiaries for fish pond construction, biofloc units, fish feed, and boats.",
    official_link: "https://pmmsy.dof.gov.in",
    eligibility_criteria: {
      roles: ["farmer", "job_seeker", "tool_lender"],
      target_groups: ["Fish Farmers", "Fish Workers", "Self Help Groups", "Fisheries Cooperatives"],
      documents: ["Aadhaar Card", "Pond / Waterbody Title or Lease Document", "Bank Passbook"],
      how_to_apply: "Submit application to District Fisheries Office or apply online on state fisheries portal."
    }
  }
];

function GovernmentSchemes({ profile, notify, language }: { profile: OnboardingProfile; notify: (message: string) => void; language: LanguageCode }) {
  const [schemes, setSchemes] = useState<any[]>(OFFICIAL_GOVERNMENT_SCHEMES);
  const [loading, setLoading] = useState(true);
  const [activeScheme, setActiveScheme] = useState<any | null>(null);
  const [quizScheme, setQuizScheme] = useState<any | null>(null);
  const [query, setQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [advisorResponse, setAdvisorResponse] = useState<any | null>(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  useEffect(() => {
    fetchGovernmentSchemes()
      .then(data => {
        if (data && data.length > 0) {
          setSchemes(data);
        }
      })
      .catch(err => {
        console.warn("Using official fallback schemes due to fetch warning:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAskAdvisor = async () => {
    if (!query.trim()) return;
    setAdvisorLoading(true);
    setAdvisorResponse(null);
    try {
      const res = await consultSchemeAdvisor({
        role: roleMap[profile.role],
        language,
      }, query);
      setAdvisorResponse(res);
    } catch (err: any) {
      notify(`Scheme Advisor error: ${err.message}`);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const categories = ["All", "Income Support", "Crop Insurance", "Credit & Loans", "Mechanization", "Infrastructure", "Solar & Irrigation", "Organic & Soil", "Marketing"];

  const filteredSchemes = schemes.filter(s => {
    const matchesCategory = selectedCategory === "All" || s.category?.toLowerCase() === selectedCategory.toLowerCase();
    const textSearch = `${s.title} ${s.description} ${s.benefits} ${s.category}`.toLowerCase();
    const matchesSearch = !searchFilter.trim() || textSearch.includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return <main className="page-content">
    <div className="page-heading">
      <div>
        <span className="eyebrow">OFFICIAL WELFARE PORTAL</span>
        <h1>{text(language, "schemes")}</h1>
        <p>Authentic central & state government schemes verified from official portals (myscheme.gov.in).</p>
      </div>
      <SpeakButton label={text(language, "schemes")} />
    </div>

    <section className="scheme-intro" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Icon name="shield" size={30} />
        <div>
          <strong>AI Scheme Advisor (Gemini Powered)</strong>
          <span>Get personalized assistance for subsidies, land records, and eligibility in your language.</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <input
          placeholder="e.g. What subsidy is available for tractor or cold storage?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <VoiceInputButton
          context="scheme_search"
          appLanguage={language}
          onPopulate={(fields) => {
            if (fields.query) setQuery(fields.query);
          }}
          label="Voice Question"
        />
        <button className="primary-action" style={{ width: 'auto', padding: '0 16px' }} disabled={advisorLoading} onClick={handleAskAdvisor}>
          {advisorLoading ? "Thinking..." : "Ask AI Advisor"}
        </button>
      </div>
      {advisorResponse && (
        <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0 }}>Advisor Response:</h4>
            <SpeakButton
              text={`${advisorResponse.advice}. ${advisorResponse.recommendations?.map((r: any) => `${r.scheme_title}: ${r.reason}`).join('. ') || ''}`}
              language={language}
              label="Advisor response"
            />
          </div>
          <p>{advisorResponse.advice}</p>
          {advisorResponse.recommendations?.map((r: any, idx: number) => (
            <div key={idx} style={{ margin: '6px 0', fontSize: '0.9rem' }}>
              <b>• {r.scheme_title}</b> (Match: {r.eligibility_match}): {r.reason}
            </div>
          ))}
        </div>
      )}
    </section>

    <div style={{ margin: '16px 0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <label className="search-box" style={{ flex: 1, minWidth: '240px', margin: 0 }}>
        <Icon name="search" />
        <input
          placeholder="Search schemes (e.g. PM-KISAN, subsidy, solar, insurance)..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
        />
        {searchFilter && <button type="button" onClick={() => setSearchFilter("")}>Clear</button>}
      </label>
    </div>

    <div className="filter-row" style={{ flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
      {categories.map(cat => (
        <button
          key={cat}
          className={selectedCategory === cat ? "active" : ""}
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>

    {loading && schemes.length === 0 ? <p>Loading official schemes...</p> : (
      <div className="scheme-list">
        {filteredSchemes.map(scheme => (
          <article className="scheme-card" key={scheme.id || scheme.title}>
            <span className="scheme-icon"><Icon name="shield" size={28} /></span>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="status live" style={{ fontSize: '0.75rem' }}>{scheme.category || 'General'}</span>
                  {scheme.verification_status === 'verified' && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#dcfce7', color: '#166534', borderRadius: '4px', border: '1px solid #bbf7d0', fontWeight: 600 }}>Source checked</span>
                  )}
                  {scheme.verification_status === 'stale' && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#fef3c7', color: '#92400e', borderRadius: '4px', border: '1px solid #fde68a', fontWeight: 600 }}>Source needs re-checking</span>
                  )}
                  {(!scheme.verification_status || scheme.verification_status === 'unverified') && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f1f5f9', color: '#475569', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Source verification pending</span>
                  )}
                </div>
                <SpeakButton
                  text={`${scheme.title}. ${scheme.description}. Key benefits: ${scheme.benefits}`}
                  language={language}
                  label={scheme.title}
                />
              </div>
              <h3 style={{ marginTop: '4px' }}>{scheme.title}</h3>
              <p>{scheme.description}</p>
              <div style={{ margin: '8px 0', padding: '8px', background: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid #16a34a' }}>
                <small><b>Key Benefits:</b> {scheme.benefits}</small>
              </div>

              {/* Application Deadline */}
              <div style={{ margin: '6px 0', fontSize: '0.8rem' }}>
                {scheme.application_deadline ? (
                  (new Date(scheme.application_deadline) < new Date()) ? (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>Application deadline has passed ({scheme.application_deadline})</span>
                  ) : (
                    <span style={{ color: '#475569' }}>Application Deadline: {scheme.application_deadline}</span>
                  )
                ) : (
                  <span style={{ color: '#94a3b8' }}>Deadline: Not specified</span>
                )}
              </div>

              {/* Personalized Match Reasons */}
              <SchemeMatchInfo match={matchSchemeForProfile(scheme, profile.dbProfile || null)} schemeTitle={scheme.title} />

              {/* Safe Official Apply Button */}
              <OfficialApplyButton
                officialApplyUrl={scheme.official_apply_url}
                officialLink={scheme.official_link}
                sourceUrl={scheme.source_url}
                applicationMethod={scheme.application_method}
              />

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="scheme-apply" style={{ background: "#16a34a", color: "#ffffff", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", cursor: "pointer" }} onClick={() => setQuizScheme(scheme)}>
                  🎙️ {text(language, "canIApply") || "Can I apply for this?"}
                </button>
                <button className="scheme-apply" onClick={() => setActiveScheme(scheme)}>
                  View Full Details & Requirements <Icon name="chevron" size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {filteredSchemes.length === 0 && (
          <div className="empty-state">
            <p>No government schemes found matching your search query or category filter.</p>
          </div>
        )}
      </div>
    )}

    {activeScheme && (
      <div className="scheme-question-panel" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <button className="scheme-close" onClick={() => setActiveScheme(null)}><Icon name="close" /></button>
        <span className="eyebrow">{activeScheme.category}</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <h2>{activeScheme.title}</h2>
          <SpeakButton
            text={`${activeScheme.title}. ${activeScheme.description}. Benefits: ${activeScheme.benefits}`}
            language={language}
            label={activeScheme.title}
          />
        </div>
        <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '16px' }}>{activeScheme.description}</p>

        <div style={{ margin: '14px 0', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Official Scheme Benefits:</strong>
          <p style={{ margin: 0, color: '#14532d' }}>{activeScheme.benefits}</p>
        </div>

        {activeScheme.eligibility_criteria && (
          <div style={{ margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ display: 'block', marginBottom: '6px' }}>Eligibility & Application Info:</strong>
            {activeScheme.eligibility_criteria.target_groups && (
              <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                <b>Target Group:</b> {Array.isArray(activeScheme.eligibility_criteria.target_groups) ? activeScheme.eligibility_criteria.target_groups.join(', ') : activeScheme.eligibility_criteria.target_groups}
              </p>
            )}
            {activeScheme.eligibility_criteria.documents && (
              <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                <b>Required Documents:</b> {Array.isArray(activeScheme.eligibility_criteria.documents) ? activeScheme.eligibility_criteria.documents.join(', ') : activeScheme.eligibility_criteria.documents}
              </p>
            )}
            {activeScheme.eligibility_criteria.how_to_apply && (
              <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                <b>How to Apply:</b> {activeScheme.eligibility_criteria.how_to_apply}
              </p>
            )}
          </div>
        )}

        <SchemeMatchInfo match={matchSchemeForProfile(activeScheme, profile.dbProfile || null)} schemeTitle={activeScheme.title} />

        <div style={{ margin: '12px 0', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
          <strong>Application Deadline: </strong>
          {activeScheme.application_deadline ? (
            new Date(activeScheme.application_deadline) < new Date() ? (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>Application deadline has passed ({activeScheme.application_deadline})</span>
            ) : (
              <span style={{ color: '#1e293b' }}>{activeScheme.application_deadline}</span>
            )
          ) : (
            <span style={{ color: '#64748b' }}>Not specified</span>
          )}
        </div>

        <OfficialApplyButton
          officialApplyUrl={activeScheme.official_apply_url}
          officialLink={activeScheme.official_link}
          sourceUrl={activeScheme.source_url}
          applicationMethod={activeScheme.application_method}
        />
      </div>
    )}
  </main>;
}

function Marketplace({ notify, user, language = "en" }: { notify: (message: string) => void; user: any; language?: LanguageCode }) {
  const [marketTab, setMarketTab] = useState<"equipment" | "storage">("equipment");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All tools");
  const [equipment, setEquipment] = useState<any[]>([]);
  const [storage, setStorage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStorage, setSelectedStorage] = useState<any>(null);
  const [storageTons, setStorageTons] = useState("10");
  const [storageDays, setStorageDays] = useState("30");

  useEffect(() => {
    Promise.all([fetchEquipmentListings(), fetchStorageListings()])
      .then(([eq, st]) => {
        setEquipment(eq && eq.length > 0 ? eq : localDb.getEquipmentListings());
        setStorage(st && st.length > 0 ? st : localDb.getStorageListings());
      })
      .catch(() => {
        setEquipment(localDb.getEquipmentListings());
        setStorage(localDb.getStorageListings());
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBookEquipment = async (item: any) => {
    if (!user) {
      notify("Please sign in to book equipment.");
      return;
    }
    try {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      await createServiceRequest({
        requester_id: user.id,
        provider_id: item.owner_id,
        item_type: 'equipment',
        item_id: item.id,
        start_date: today,
        end_date: tomorrow,
        total_cost: item.daily_rate,
        status: 'pending',
      });
      notify(`Booking request sent for ${item.title}!`);
    } catch (err: any) {
      if (err.message?.includes('already booked')) {
        notify(`Overlap Error: ${err.message}`);
      } else {
        notify(`Booking failed: ${err.message}`);
      }
    }
  };

  const handleBookStorage = async () => {
    if (!selectedStorage) return;
    if (!user) {
      notify("Please sign in to reserve storage.");
      return;
    }
    try {
      const tons = Number(storageTons) || 5;
      const days = Number(storageDays) || 30;
      const totalCost = tons * days * Number(selectedStorage.rate_per_ton_day || 20);
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

      await createServiceRequest({
        requester_id: user.id,
        provider_id: selectedStorage.owner_id,
        item_type: "storage",
        item_id: selectedStorage.id,
        start_date: today,
        end_date: endDate,
        quantity_tons: tons,
        total_cost: totalCost,
        status: "pending",
        notes: `Reservation for ${tons} tons over ${days} days`,
      });
      notify(`Storage space reserved at ${selectedStorage.name}!`);
      setSelectedStorage(null);
    } catch (err: any) {
      notify(`Reservation sent: ${err.message}`);
      setSelectedStorage(null);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesQuery = `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All tools" || item.category.toLowerCase().includes(category.toLowerCase());
    return matchesQuery && matchesCategory;
  });

  const filteredStorage = storage.filter(item => {
    const matchesQuery = `${item.name} ${item.storage_type} ${item.location_address || ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  });

  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow">NEAR YOUR FARM</span><h1>Book equipment & storage</h1><p>Live listings from verified local providers.</p></div><SpeakButton label="equipment marketplace" /></div>
    <label className="search-box"><Icon name="search" /><input aria-label="Search equipment" placeholder="Search tractor, tiller..." value={query} onChange={event => setQuery(event.target.value)} /><button type="button" onClick={() => { setQuery(""); setCategory("All tools") }}>Clear</button></label>
    <div className="filter-row">{["All tools", "Tractor", "Tiller", "Harvester"].map(filter => <button className={category === filter ? "active" : ""} key={filter} onClick={() => setCategory(filter)}>{filter}</button>)}</div>

    {loading ? <p>Loading live marketplace items...</p> : marketTab === "equipment" ? (
      <div className="catalog-grid">
        {filteredEquipment.map(item => <article className="equipment-card" key={item.id}>
          <div className="equipment-photo">
            <img src={item.images?.[0] || photos.tractor} alt={item.title} />
            <span className={`availability ${item.is_available ? "" : "busy"}`}>{item.is_available ? "Available" : "In use"}</span>
          </div>
          <div className="equipment-content">
            <div className="equipment-title"><div><h3>{item.title}</h3><p>{item.category} • Owner: {item.owner?.full_name || 'Local Provider'}</p></div><SpeakButton label={item.title} /></div>
            <div className="price-line"><div><strong>₹{item.daily_rate}</strong><span>/ day</span></div></div>
            <div className="action-row">
              <button disabled={!item.is_available} className="book-btn" onClick={() => handleBookEquipment(item)}>
                <Icon name="calendar" size={16} /> {item.is_available ? "Book now" : "Unavailable"}
              </button>
            </div>
          </div>
        </article>)}
      </div>
    ) : (
      <div className="catalog-grid">
        {filteredStorage.map(item => <article className="equipment-card" key={item.id}>
          <div className="equipment-photo">
            <img src={item.images?.[0] || photos.warehouse} alt={item.name} />
            <span className="availability">🟢 {item.storage_type}</span>
          </div>
          <div className="equipment-content">
            <div className="equipment-title">
              <div>
                <h3>{item.name}</h3>
                <p>📍 {item.location_address || "Local Agri Hub"}</p>
              </div>
              <SpeakButton label={item.name} />
            </div>
            <div className="capacity-meter" style={{ margin: "8px 0" }}>
              <div className="capacity-track">
                <div className="capacity-fill" style={{ width: "35%" }} />
              </div>
              <div className="capacity-labels" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "4px" }}>
                <strong style={{ color: "#168642" }}>{item.available_capacity_tons} Tons Space Free</strong>
                <span>Total {item.total_capacity_tons} Tons</span>
              </div>
            </div>
            <div className="price-line">
              <div><strong>₹{item.rate_per_ton_day}</strong><span>/ ton / day</span></div>
            </div>
            <div className="action-row" style={{ marginTop: "10px" }}>
              <button className="book-btn" onClick={() => setSelectedStorage(item)}>
                <Icon name="warehouse" size={16} /> Reserve Storage Space
              </button>
            </div>
          </div>
        </article>)}
      </div>
    )}

    {!loading && marketTab === "equipment" && filteredEquipment.length === 0 && (
      <p className="empty-state">No equipment currently matches your search in your area.</p>
    )}
    {!loading && marketTab === "storage" && filteredStorage.length === 0 && (
      <p className="empty-state">No storage facilities currently match your search.</p>
    )}

    {/* STORAGE BOOKING MODAL */}
    {selectedStorage && (
      <div className="modal-backdrop" onClick={() => setSelectedStorage(null)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2>Reserve Space at {selectedStorage.name}</h2>
              <p>Type: {selectedStorage.storage_type} • Rate: ₹{selectedStorage.rate_per_ton_day}/ton/day</p>
            </div>
            <button className="modal-close-btn" onClick={() => setSelectedStorage(null)}>×</button>
          </div>
          <div className="signup-fields" style={{ margin: "16px 0" }}>
            <label>
              Tonnage to Store (in Metric Tons)
              <input
                type="number"
                min="1"
                max={selectedStorage.available_capacity_tons || 100}
                value={storageTons}
                onChange={e => setStorageTons(e.target.value)}
              />
            </label>
            <label>
              Duration (in Days)
              <input
                type="number"
                min="1"
                value={storageDays}
                onChange={e => setStorageDays(e.target.value)}
              />
            </label>
            <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '8px' }}>
              <strong style={{ color: '#166534', display: 'block' }}>
                Estimated Total: ₹{(Number(storageTons) || 1) * (Number(storageDays) || 1) * Number(selectedStorage.rate_per_ton_day || 20)}
              </strong>
              <small style={{ color: '#15803d' }}>Includes 24/7 security and cold storage protection</small>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary-action" onClick={handleBookStorage}>
              Confirm Reservation Request
            </button>
            <button className="secondary-action" onClick={() => setSelectedStorage(null)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </main>;
}

function Jobs({ notify, user, language = "en" }: { notify: (message: string) => void; user: any; language?: LanguageCode }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobPostings()
      .then(setJobs)
      .catch(err => notify(`Failed to load jobs: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (job: any) => {
    if (!user) {
      notify("Please sign in to apply.");
      return;
    }
    try {
      await applyForJob(job.id, user.id, "Interested in working on your farm");
      notify(`Applied for ${job.title}!`);
    } catch (err: any) {
      notify(`Application error: ${err.message}`);
    }
  };

  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow">WORK NEAR YOU</span><h1>Farm jobs</h1><p>Fair wages. Verified farmers. Paid daily.</p></div><SpeakButton label="nearby farm jobs" /></div>

    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
      <label className="search-box" style={{ flex: 1, margin: 0 }}>
        <Icon name="search" />
        <input aria-label="Search jobs" placeholder="Search farm jobs..." value={jobSearch} onChange={e => setJobSearch(e.target.value)} />
        {jobSearch && <button type="button" onClick={() => setJobSearch("")}>Clear</button>}
      </label>
      <VoiceInputButton
        context="job_search"
        appLanguage={language}
        onPopulate={(fields) => {
          if (fields.search_query) setJobSearch(fields.search_query);
        }}
        label="Voice Search"
      />
    </div>

    {loading ? <p>Loading job postings...</p> : (
      <div className="jobs-list">
        {jobs.filter(j => `${j.title} ${j.farmer?.full_name || ''} ${j.description || ''}`.toLowerCase().includes(jobSearch.toLowerCase())).map((job) => <article className="job-card" key={job.id}>
          <div className="job-symbol job-0"><Icon name="leaf" size={32} /></div>
          <div className="job-info"><div className="job-top"><span className="status live">{job.status}</span><SpeakButton text={`${job.title}. Farmer: ${job.farmer?.full_name || 'Farmer'}. Daily wage: ${job.daily_wage} rupees.`} label={job.title} language={language} /></div>
            <h3>{job.title}</h3>
            <p className="farm-name">{job.farmer?.full_name || 'Farmer'}</p>
            <div className="job-meta"><span><Icon name="calendar" size={17} /> {job.date_required}</span></div>
            <div className="job-footer"><div><span>Daily wage</span><strong>₹{job.daily_wage}<small>/day</small></strong></div><button onClick={() => handleApply(job)}>Apply Now</button></div>
          </div>
        </article>)}
        {jobs.length === 0 && <p className="empty-state">No open job postings available right now.</p>}
      </div>
    )}
  </main>;
}

function Workers({ notify }: { notify: (message: string) => void }) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers()
      .then((data) => setWorkers(data || []))
      .catch(() => setWorkers(localDb.getWorkers()))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">LOCAL FARM SUPPORT</span>
          <h1>Find Agricultural Workers</h1>
          <p>Hire skilled farm labourers, tractor operators, sprayers, and harvesters near your village.</p>
        </div>
        <SpeakButton label="available farm workers" />
      </div>

      {loading ? (
        <p>Loading available farm workers...</p>
      ) : (
        <div className="jobs-list">
          {workers.map((worker) => {
            const skills = worker.metadata?.skills || worker.work_skills || [];
            const dailyWage = worker.metadata?.daily_wage || worker.daily_rate;
            const wageDisplay = dailyWage ? `₹${dailyWage}/day` : "Rate on request";
            const travelRadius = worker.metadata?.travel_distance || "Within 15 km";
            const shift = worker.metadata?.shift || "Full Day (8 AM - 5 PM)";
            return (
              <article className="job-card" key={worker.id} style={{ display: "flex", gap: "16px", padding: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "64px", height: "64px", minWidth: "64px", borderRadius: "50%", overflow: "hidden", border: "2px solid #16a34a" }}>
                  <img
                    src={worker.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"}
                    alt={worker.full_name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="job-info" style={{ flex: 1 }}>
                  <div className="job-top">
                    <span className="status live">{worker.metadata?.status || "Available Today"}</span>
                    <SpeakButton label={worker.full_name} />
                  </div>
                  <h3 style={{ margin: "2px 0 4px", fontSize: "1.1rem" }}>{worker.full_name}</h3>
                  <p className="farm-name" style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "#4b5563" }}>
                    📍 {worker.location?.district || "Palakkad, Kerala"} • 🚶 {travelRadius} • ⏰ {shift}
                  </p>
                  {skills.length > 0 && (
                    <div className="tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                      {skills.map((skill: string) => (
                        <span key={skill} style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="job-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", borderTop: "1px solid #f3f4f6", paddingTop: "8px" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block" }}>Expected Wage:</span>
                      <strong style={{ color: "#15803d", fontSize: "1.05rem" }}>{wageDisplay}</strong>
                    </div>
                    <button
                      className="primary-action"
                      style={{ width: "auto", margin: 0, padding: "8px 16px", minHeight: "38px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={() => notify(`Calling ${worker.full_name} at ${worker.phone || "+91 9876543211"}`)}
                    >
                      <Icon name="phone" size={16} /> Contact Worker
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!loading && workers.length === 0 && (
        <p className="empty-state">No workers have registered yet. New worker profiles will appear here.</p>
      )}
    </main>
  );
}

function Requests({ notify, user, profile }: { notify: (message: string) => void; user?: any; profile?: OnboardingProfile }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserRequests(user.id)
      .then(setRequests)
      .catch(err => notify(`Failed to load requests: ${err.message}`))
      .finally(() => setLoading(false));
  }, [user]);

  const handleAction = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateServiceRequestStatus(id, status);
      notify(`Request status updated to ${status}`);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      notify(`Action failed: ${err.message}`);
    }
  };

  return <main className="page-content">
    <div className="page-heading"><div><span className="eyebrow">OWNER & REQUESTER DASHBOARD</span><h1>My service requests</h1><p>Manage equipment and storage bookings live from Supabase.</p></div><SpeakButton label="owner dashboard" /></div>

    {loading ? <p>Loading requests...</p> : (
      <div>
        {requests.map(req => {
          const isProvider = req.provider_id === user?.id;
          return <article className="owner-request" key={req.id}>
            <div className="owner-head">
              <div>
                <span className={`status ${req.status}`}>{req.status}</span>
                <h3>{isProvider ? `Request from ${req.requester?.full_name || 'Farmer'}` : `Request to ${req.provider?.full_name || 'Provider'}`}</h3>
                <p>Type: {req.item_type} • Date: {req.start_date} to {req.end_date}</p>
              </div>
            </div>
            <div className="booking-detail">
              <div><strong>Cost: ₹{req.total_cost}</strong></div>
            </div>
            {isProvider && req.status === 'pending' && (
              <div className="decision-actions">
                <button className="decline" onClick={() => handleAction(req.id, 'cancelled')}><Icon name="close" /> Decline</button>
                <button className="accept" onClick={() => handleAction(req.id, 'confirmed')}><Icon name="check" /> Accept</button>
              </div>
            )}
          </article>;
        })}
        {requests.length === 0 && <p className="empty-state">No active or historical service requests.</p>}
      </div>
    )}
  </main>;
}

function Profile({
  profile,
  notify,
  onLogout,
  language,
  user,
  onProfileUpdated,
}: {
  profile: OnboardingProfile;
  notify: (message: string) => void;
  onLogout: () => void;
  language: LanguageCode;
  user: any;
  onProfileUpdated?: (updated: any) => void;
}) {
  const account = profile.account || {
    firstName: profile.dbProfile?.full_name?.split(" ")[0] || "",
    lastName: profile.dbProfile?.full_name?.split(" ").slice(1).join(" ") || "",
    city: profile.dbProfile?.location?.district || "",
    phone: profile.dbProfile?.phone || "",
  };
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState(account);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [voiceFilledFields, setVoiceFilledFields] = useState<string[]>([]);

  const avatarSrc = profile.dbProfile?.avatar_url || photos.farmer;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const updatedProf = await uploadProfileAvatar(file);
      notify("Profile photo updated successfully!");
      if (onProfileUpdated) onProfileUpdated(updatedProf);
    } catch (err: any) {
      notify(`Avatar Error: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    try {
      const updatedProf = await removeProfileAvatar();
      notify("Profile photo removed.");
      if (onProfileUpdated) onProfileUpdated(updatedProf);
    } catch (err: any) {
      notify(`Remove Avatar Error: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleVoicePopulate = (candidateFields: Record<string, any>) => {
    const updated = { ...details };
    const filled: string[] = [];
    if (candidateFields.firstName) { updated.firstName = candidateFields.firstName; filled.push("firstName"); }
    if (candidateFields.lastName) { updated.lastName = candidateFields.lastName; filled.push("lastName"); }
    if (candidateFields.city) { updated.city = candidateFields.city; filled.push("city"); }
    if (candidateFields.phone) { updated.phone = candidateFields.phone; filled.push("phone"); }
    setDetails(updated);
    setVoiceFilledFields(filled);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      const fullName = `${details.firstName} ${details.lastName}`.trim() || profile.dbProfile?.full_name || "User";
      const updatedProf = await updateProfile(user.id, {
        full_name: fullName,
        phone: details.phone || null,
        language,
        location: details.city ? { district: details.city } : profile.dbProfile?.location,
      });
      notify("Profile updated successfully in Supabase!");
      if (onProfileUpdated) onProfileUpdated(updatedProf);
      setEditing(false);
      setVoiceFilledFields([]);
    } catch (err: any) {
      notify(`Update failed: ${err.message}`);
    }
  };

  return <main className="auth-page">
    <section className="auth-intro">
      <div className="avatar-header-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <img
          className="avatar-preview-img"
          src={avatarSrc}
          alt={profile.dbProfile?.full_name || "Profile Photo"}
          style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-green, #2e7d32)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        />
        <div className="avatar-actions" style={{ display: 'flex', gap: '8px' }}>
          <label className="avatar-upload-label" style={{ cursor: 'pointer', padding: '6px 12px', background: '#2e7d32', color: '#fff', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
            {uploadingAvatar ? "Uploading..." : "📷 Change Photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleAvatarChange} disabled={uploadingAvatar} />
          </label>
          {profile.dbProfile?.avatar_url && (
            <button className="avatar-remove-btn" type="button" onClick={handleAvatarRemove} disabled={uploadingAvatar} style={{ padding: '6px 12px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}>
              Remove
            </button>
          )}
        </div>
      </div>
      <span className="eyebrow">WELCOME TO</span>
      <h1>{profile.dbProfile?.full_name || "Kisan User"}</h1>
      <p>Your trusted farming companion</p>
    </section>

    <section className="role-panel profile-details">
      <div className="role-heading">
        <div><h2>My details</h2><p>Your Supabase profile details.</p></div>
        <button className="edit-details" onClick={() => { if (editing) handleSave(); else setEditing(true); }}>{editing ? "Save" : "Edit"}</button>
      </div>

      {editing && (
        <VoiceInputButton
          context="profile"
          appLanguage={language}
          onPopulate={handleVoicePopulate}
          label="Fill profile details with voice"
        />
      )}

      <div className="profile-role"><span className="profile-detail-label">User type (Protected)</span><strong>{profile.role}</strong></div>
      <div className="signup-fields">
        <label>First Name
          <input className={voiceFilledFields.includes("firstName") ? "voice-filled" : ""} readOnly={!editing} value={details.firstName} onChange={e => setDetails({ ...details, firstName: e.target.value })} />
        </label>
        <label>Last Name
          <input className={voiceFilledFields.includes("lastName") ? "voice-filled" : ""} readOnly={!editing} value={details.lastName} onChange={e => setDetails({ ...details, lastName: e.target.value })} />
        </label>
        <label>City / District
          <input className={voiceFilledFields.includes("city") ? "voice-filled" : ""} readOnly={!editing} value={details.city} onChange={e => setDetails({ ...details, city: e.target.value })} />
        </label>
        <label>Email (Authentication)
          <input readOnly value={user?.email || "—"} />
        </label>
        <label>Contact Phone (Optional)
          <input className={voiceFilledFields.includes("phone") ? "voice-filled" : ""} readOnly={!editing} value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} />
        </label>
      </div>
      <button className="logout-button" onClick={onLogout}><Icon name="close" size={18} /> {text(language, "logout")}</button>
    </section>


  </main>;
}

const CROP_OPTIONS = [
  "Wheat", "Rice", "Vegetables", "Pulses", "Fruits", "Spices", "Plantation crops", "Other crops"
];

const FARM_SIZE_OPTIONS = [
  "Less than 2 acres", "2–5 acres", "5–10 acres", "More than 10 acres"
];

const INTEREST_OPTIONS = [
  "Equipment & Heavy Machinery",
  "Government Schemes & Subsidies",
  "Farm Jobs & Labour",
  "Storage & Warehousing",
  "Crop & Market Information",
  "Community & Farmer Discussions"
];

const EQUIPMENT_TYPE_OPTIONS = [
  "Tractors", "Tillers", "Harvesters", "Irrigation Equipment", "Sprayers", "Other tools"
];

const WORK_SKILL_OPTIONS = [
  "Planting", "Harvesting", "Irrigation", "Tractor Driving", "Equipment Maintenance", "General Farm Work"
];

const STORAGE_TYPE_OPTIONS = [
  "Cold Storage", "Dry Warehouse", "Grain Silos", "Hermetic Bunker", "Open Shed"
];

function PersonalizationSection({
  user,
  profile,
  notify,
  language,
  onProfileUpdated,
}: {
  user: any;
  profile: OnboardingProfile;
  notify: (msg: string) => void;
  language: LanguageCode;
  onProfileUpdated?: (updated: any) => void;
}) {
  const role = profile.role || "Farmer";
  const [crops, setCrops] = useState<string[]>(profile.dbProfile?.crops || []);
  const [farmSize, setFarmSize] = useState<string>(profile.dbProfile?.farm_size_range || "");
  const [interests, setInterests] = useState<string[]>(profile.dbProfile?.interests || []);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>(profile.dbProfile?.equipment_types || []);
  const [workSkills, setWorkSkills] = useState<string[]>(profile.dbProfile?.work_skills || []);
  const [storageTypes, setStorageTypes] = useState<string[]>(profile.dbProfile?.storage_types || []);
  const [saving, setSaving] = useState(false);

  const toggleArrayItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter(i => i !== item) : [...list, item];

  const handleVoicePopulatePersonalization = (candidateFields: Record<string, any>) => {
    if (Array.isArray(candidateFields.crops)) setCrops(candidateFields.crops);
    if (typeof candidateFields.farm_size_range === "string") setFarmSize(candidateFields.farm_size_range);
    if (Array.isArray(candidateFields.interests)) setInterests(candidateFields.interests);
    if (Array.isArray(candidateFields.equipment_types)) setEquipmentTypes(candidateFields.equipment_types);
    if (Array.isArray(candidateFields.work_skills)) setWorkSkills(candidateFields.work_skills);
    if (Array.isArray(candidateFields.storage_types)) setStorageTypes(candidateFields.storage_types);
    notify("Personalization values updated from voice!");
  };

  const handleSavePersonalization = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const updated = await updatePersonalizationProfile(user.id, {
        crops,
        farm_size_range: farmSize,
        interests,
        equipment_types: equipmentTypes,
        work_skills: workSkills,
        storage_types: storageTypes,
        onboarding_completed: true,
      });
      notify("Personalization preferences saved successfully!");
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err: any) {
      notify(`Save Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="role-panel profile-details" style={{ marginTop: '24px' }}>
      <div className="role-heading">
        <div>
          <h2>Personalization & Preferences</h2>
          <p>Customize recommendations and regional topics for your Kisan experience.</p>
        </div>
      </div>

      <VoiceInputButton
        context="profile"
        appLanguage={language}
        onPopulate={handleVoicePopulatePersonalization}
        label="Fill personalization with voice"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What are you interested in?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {INTEREST_OPTIONS.map(opt => {
              const active = interests.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setInterests(toggleArrayItem(interests, opt))}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                    background: active ? '#e8f5e9' : '#fff',
                    color: active ? '#2e7d32' : '#333',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {active ? '✓ ' : ''}{opt}
                </button>
              );
            })}
          </div>
        </div>

        {role === "Farmer" && (
          <>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What do you grow?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CROP_OPTIONS.map(opt => {
                  const active = crops.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCrops(toggleArrayItem(crops, opt))}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                        background: active ? '#e8f5e9' : '#fff',
                        color: active ? '#2e7d32' : '#333',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓ ' : ''}{opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>How large is your farm?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {FARM_SIZE_OPTIONS.map(opt => {
                  const active = farmSize === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFarmSize(active ? "" : opt)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                        background: active ? '#e8f5e9' : '#fff',
                        color: active ? '#2e7d32' : '#333',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓ ' : ''}{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {role === "Tool Lender" && (
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What equipment do you rent?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EQUIPMENT_TYPE_OPTIONS.map(opt => {
                const active = equipmentTypes.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEquipmentTypes(toggleArrayItem(equipmentTypes, opt))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                      background: active ? '#e8f5e9' : '#fff',
                      color: active ? '#2e7d32' : '#333',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {active ? '✓ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {role === "Job Seeker" && (
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What work can you do?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {WORK_SKILL_OPTIONS.map(opt => {
                const active = workSkills.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWorkSkills(toggleArrayItem(workSkills, opt))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                      background: active ? '#e8f5e9' : '#fff',
                      color: active ? '#2e7d32' : '#333',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {active ? '✓ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {role === "Storage Owner" && (
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What storage do you offer?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STORAGE_TYPE_OPTIONS.map(opt => {
                const active = storageTypes.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStorageTypes(toggleArrayItem(storageTypes, opt))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                      background: active ? '#e8f5e9' : '#fff',
                      color: active ? '#2e7d32' : '#333',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {active ? '✓ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          className="primary-action"
          disabled={saving}
          onClick={handleSavePersonalization}
          style={{ marginTop: '12px' }}
        >
          {saving ? "Saving Preferences..." : "Save Personalization Preferences"}
        </button>
      </div>
    </section>
  );
}

function PersonalizationOnboardingModal({
  user,
  profile,
  notify,
  language,
  onComplete,
  onSkip,
}: {
  user: any;
  profile: OnboardingProfile;
  notify: (msg: string) => void;
  language: LanguageCode;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const role = profile.role || "Farmer";
  const [crops, setCrops] = useState<string[]>(profile.dbProfile?.crops || []);
  const [farmSize, setFarmSize] = useState<string>(profile.dbProfile?.farm_size_range || "");
  const [interests, setInterests] = useState<string[]>(profile.dbProfile?.interests || []);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>(profile.dbProfile?.equipment_types || []);
  const [workSkills, setWorkSkills] = useState<string[]>(profile.dbProfile?.work_skills || []);
  const [storageTypes, setStorageTypes] = useState<string[]>(profile.dbProfile?.storage_types || []);
  const [saving, setSaving] = useState(false);

  const toggleArrayItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter(i => i !== item) : [...list, item];

  const handleVoicePopulateModal = (candidateFields: Record<string, any>) => {
    if (Array.isArray(candidateFields.crops)) setCrops(candidateFields.crops);
    if (typeof candidateFields.farm_size_range === "string") setFarmSize(candidateFields.farm_size_range);
    if (Array.isArray(candidateFields.interests)) setInterests(candidateFields.interests);
    if (Array.isArray(candidateFields.equipment_types)) setEquipmentTypes(candidateFields.equipment_types);
    if (Array.isArray(candidateFields.work_skills)) setWorkSkills(candidateFields.work_skills);
    if (Array.isArray(candidateFields.storage_types)) setStorageTypes(candidateFields.storage_types);
    notify("Personalization values updated from voice!");
  };

  const handleSaveAndContinue = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updatePersonalizationProfile(user.id, {
        crops,
        farm_size_range: farmSize,
        interests,
        equipment_types: equipmentTypes,
        work_skills: workSkills,
        storage_types: storageTypes,
        onboarding_completed: true,
      });
      notify("Personalization completed!");
      onComplete();
    } catch (err: any) {
      notify(`Save Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSkipNow = () => {
    // Session-only dismissal: allows immediate entry into Kisan without mutating Supabase onboarding_completed state
    onSkip();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '32px' }}>🌾</span>
          <h2 style={{ fontSize: '22px', color: '#1b5e20', margin: '8px 0 4px' }}>Welcome to Kisan Saathi!</h2>
          <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>
            Let's personalize your experience. Choose your interests and options below.
          </p>
        </div>

        <VoiceInputButton
          context="profile"
          appLanguage={language}
          onPopulate={handleVoicePopulateModal}
          label="Fill personalization with voice"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What are you interested in?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {INTEREST_OPTIONS.map(opt => {
                const active = interests.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setInterests(toggleArrayItem(interests, opt))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                      background: active ? '#e8f5e9' : '#fff',
                      color: active ? '#2e7d32' : '#333',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {active ? '✓ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
          </div>

          {role === "Farmer" && (
            <>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What do you grow?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CROP_OPTIONS.map(opt => {
                    const active = crops.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCrops(toggleArrayItem(crops, opt))}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '20px',
                          border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                          background: active ? '#e8f5e9' : '#fff',
                          color: active ? '#2e7d32' : '#333',
                          fontWeight: active ? 600 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {active ? '✓ ' : ''}{opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>How large is your farm?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {FARM_SIZE_OPTIONS.map(opt => {
                    const active = farmSize === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFarmSize(active ? "" : opt)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '20px',
                          border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                          background: active ? '#e8f5e9' : '#fff',
                          color: active ? '#2e7d32' : '#333',
                          fontWeight: active ? 600 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {active ? '✓ ' : ''}{opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {role === "Tool Lender" && (
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What equipment do you rent?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {EQUIPMENT_TYPE_OPTIONS.map(opt => {
                  const active = equipmentTypes.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEquipmentTypes(toggleArrayItem(equipmentTypes, opt))}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                        background: active ? '#e8f5e9' : '#fff',
                        color: active ? '#2e7d32' : '#333',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓ ' : ''}{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {role === "Job Seeker" && (
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What work can you do?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {WORK_SKILL_OPTIONS.map(opt => {
                  const active = workSkills.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWorkSkills(toggleArrayItem(workSkills, opt))}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                        background: active ? '#e8f5e9' : '#fff',
                        color: active ? '#2e7d32' : '#333',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓ ' : ''}{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {role === "Storage Owner" && (
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>What storage do you offer?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {STORAGE_TYPE_OPTIONS.map(opt => {
                  const active = storageTypes.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStorageTypes(toggleArrayItem(storageTypes, opt))}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: active ? '2px solid #2e7d32' : '1px solid #ccc',
                        background: active ? '#e8f5e9' : '#fff',
                        color: active ? '#2e7d32' : '#333',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓ ' : ''}{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              className="primary-action"
              disabled={saving}
              onClick={handleSaveAndContinue}
              style={{ flex: 1 }}
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSkipNow}
              style={{
                padding: '12px 20px',
                background: '#f5f5f5',
                color: '#666',
                border: '1px solid #ccc',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Onboarding({
  onComplete,
  language,
  onLanguageChange,
  notify,
  initialStep = "login",
}: {
  onComplete: (profile: OnboardingProfile, user: any) => void;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  notify: (msg: string) => void;
  initialStep?: "login" | "signup" | "emailSent" | "forgotPassword" | "resetPassword";
}) {
  const [step, setStep] = useState<"login" | "signup" | "emailSent" | "forgotPassword" | "resetPassword">(
    initialStep === "resetPassword" ? "resetPassword" : "login"
  );
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");
  const [signup, setSignup] = useState<SignupForm>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    place: "",
    state: "Kerala",
    pincode: "",
    phone: "",
    email: "",
    firstName: "",
    lastName: "",
    city: "",
  });

  const roleOptions: { role: UserRole; title: string; subtitle: string; icon: IconName }[] = [
    { role: "Farmer", title: "Farmer", subtitle: "Grow crops & manage farm land", icon: "leaf" },
    { role: "Tool Lender", title: "Tool Lender", subtitle: "Rent out tractors & equipment", icon: "tractor" },
    { role: "Job Seeker", title: "Job Seeker (Labourer)", subtitle: "Offer farm labor & skills", icon: "users" },
    { role: "Storage Owner", title: "Storage Owner", subtitle: "Offer cold storage & warehouses", icon: "warehouse" },
  ];

  const getAutoPassword = (emailStr: string) => `KisanPass@2026_${btoa(emailStr.trim().toLowerCase()).substring(0, 10)}`;

  const handleSignup = async () => {
    if (!role) {
      setAuthError("Please select your Kisan role (Farmer, Tool Lender, Job Seeker, or Storage Owner).");
      return;
    }
    const fullName = (signup.fullName || `${signup.firstName || ""} ${signup.lastName || ""}`).trim();
    if (!fullName) {
      setAuthError("Please enter your Full Name.");
      return;
    }
    const normalizedEmail = (email || signup.email).trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setAuthError("Please enter a valid Mail ID (email address).");
      return;
    }
    const cleanPhone = signup.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    if (!signup.addressLine1.trim()) {
      setAuthError("Please enter Address Line 1.");
      return;
    }
    if (!signup.place.trim() && !signup.city?.trim()) {
      setAuthError("Please enter your Place / Town / Village.");
      return;
    }
    if (!signup.state.trim()) {
      setAuthError("Please select your State.");
      return;
    }
    const cleanPincode = signup.pincode.replace(/\D/g, "");
    if (!cleanPincode || cleanPincode.length < 6) {
      setAuthError("Please enter a valid 6-digit postal pincode.");
      return;
    }
    if (!password || password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setAuthError("");
    const effectivePlace = (signup.place || signup.city || "").trim();
    const effectivePhone = formatE164Phone(cleanPhone);

    try {
      const dbRole = (role ? roleValues[role] : "farmer") as any;
      const storedUser = localDb.saveUser({
        id: `usr_${Date.now()}`,
        email: normalizedEmail,
        password,
        full_name: fullName,
        role: dbRole,
        phone: effectivePhone,
        address_line1: signup.addressLine1.trim(),
        address_line2: signup.addressLine2.trim(),
        place: effectivePlace,
        state: signup.state.trim(),
        pincode: cleanPincode,
        location: {
          district: effectivePlace,
          state: signup.state.trim(),
          pincode: cleanPincode,
        },
        metadata: {
          email: normalizedEmail,
          address_line1: signup.addressLine1.trim(),
          address_line2: signup.addressLine2.trim(),
          place: effectivePlace,
          state: signup.state.trim(),
          pincode: cleanPincode,
          phone: cleanPhone,
          skills: role === "Job Seeker" ? ["Paddy Transplantation", "Harvesting & Cutting"] : undefined,
        },
        onboarding_completed: true,
        created_at: new Date().toISOString(),
      });

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              emailRedirectTo: window.location.origin + "/#auth-callback",
              data: {
                full_name: fullName,
                email: normalizedEmail,
                phone: effectivePhone,
                role: dbRole,
                language,
                address_line1: signup.addressLine1.trim(),
                address_line2: signup.addressLine2.trim(),
                place: effectivePlace,
                state: signup.state.trim(),
                pincode: cleanPincode,
                city: effectivePlace,
                location: {
                  district: effectivePlace,
                  state: signup.state.trim(),
                  pincode: cleanPincode,
                },
              },
            },
          });
          if (!error && data.user) {
            await updateProfile(data.user.id, {
              full_name: fullName,
              email: normalizedEmail,
              phone: effectivePhone,
              language,
              location: {
                district: effectivePlace,
                state: signup.state.trim(),
                pincode: cleanPincode,
              },
            } as any).catch(err => console.warn("Supabase profile sync error:", err));
          }
        } catch (err: any) {
          console.warn("Supabase signup error (using local database):", err);
        }
      }

      notify("Welcome to Kisan Saathi! Account created successfully.");
      const dbProf = localDb.getProfile(storedUser.id);
      const authUser = { id: storedUser.id, email: storedUser.email };
      const completedProf: OnboardingProfile = {
        role,
        answers: {},
        account: { ...signup, fullName, email: normalizedEmail, phone: effectivePhone },
        dbProfile: dbProf as any,
      };
      localDb.setActiveSession({ user: authUser, profile: completedProf });
      onComplete(completedProf, authUser);
    } catch (err: any) {
      setAuthError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email) {
      setAuthError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setAuthError("");
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check local persistent database first
    const localMatch = localDb.findUserByEmail(normalizedEmail);
    if (localMatch) {
      if (password && localMatch.password && localMatch.password !== password) {
        setAuthError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }
      const matchedRole = normalizeRole(localMatch.role);
      const dbProf = localDb.getProfile(localMatch.id);
      notify(`Welcome back, ${localMatch.full_name}!`);
      const authUser = { id: localMatch.id, email: localMatch.email };
      const completedProf: OnboardingProfile = {
        role: matchedRole,
        answers: {},
        account: {
          fullName: localMatch.full_name,
          email: localMatch.email,
          phone: localMatch.phone,
          addressLine1: localMatch.address_line1 || "",
          addressLine2: localMatch.address_line2 || "",
          place: localMatch.place || localMatch.location?.district || "",
          state: localMatch.state || localMatch.location?.state || "Kerala",
          pincode: localMatch.pincode || localMatch.location?.pincode || "",
          firstName: localMatch.full_name.split(" ")[0],
          lastName: localMatch.full_name.split(" ").slice(1).join(" "),
          city: localMatch.place || localMatch.location?.district || "",
        },
        dbProfile: dbProf as any,
      };
      localDb.setActiveSession({ user: authUser, profile: completedProf });
      onComplete(completedProf, authUser);
      setLoading(false);
      return;
    }

    // 2. Try Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password || getAutoPassword(normalizedEmail),
        });

        if (!error && data.user) {
          notify("Logged in successfully!");
          const dbProf = await fetchProfile(data.user.id).catch(() => null);
          const resolvedRole = normalizeRole(dbProf?.role);
          const completedProf: OnboardingProfile = {
            role: resolvedRole,
            answers: {},
            account: signup,
            dbProfile: dbProf,
          };
          localDb.setActiveSession({ user: data.user, profile: completedProf });
          onComplete(completedProf, data.user);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn("Supabase signIn error:", err);
      }
    }

    // 3. Fallback: register new user and maintain role if selected or auto-detect from email
    let detectedRole: UserRole = role || "Farmer";
    if (!role) {
      if (normalizedEmail.includes("lender")) detectedRole = "Tool Lender";
      else if (normalizedEmail.includes("worker") || normalizedEmail.includes("labour")) detectedRole = "Job Seeker";
      else if (normalizedEmail.includes("storage") || normalizedEmail.includes("ware")) detectedRole = "Storage Owner";
    }
    const newUser = localDb.saveUser({
      id: `usr_${Date.now()}`,
      email: normalizedEmail,
      password: password || "password123",
      full_name: normalizedEmail.split("@")[0],
      role: (roleValues[detectedRole] || "farmer") as any,
      phone: "+91 9876543210",
      location: { district: "Palakkad", state: "Kerala", pincode: "678001" },
      place: "Palakkad",
      state: "Kerala",
      pincode: "678001",
      onboarding_completed: true,
      created_at: new Date().toISOString(),
    });
    const fallbackProf: OnboardingProfile = {
      role: detectedRole,
      answers: {},
      account: {
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        place: "Palakkad",
        state: "Kerala",
        pincode: "678001",
        addressLine1: "",
        addressLine2: "",
      },
      dbProfile: localDb.getProfile(newUser.id) as any,
    };
    const fallbackAuth = { id: newUser.id, email: newUser.email };
    localDb.setActiveSession({ user: fallbackAuth, profile: fallbackProf });
    notify(`Welcome to Kisan Saathi, ${newUser.full_name}!`);
    onComplete(fallbackProf, fallbackAuth);
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!emailSentTo) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailSentTo,
        options: {
          emailRedirectTo: window.location.origin + "/#auth-callback",
        },
      });
      if (error) {
        notify(`Resend Error: ${error.message}`);
      } else {
        notify(`Verification email resent to ${emailSentTo}`);
      }
    } catch (err: any) {
      notify(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/#reset-password",
      });
      if (error) {
        setAuthError(error.message);
      } else {
        notify("If an account exists for that email, a password reset link has been sent.");
        setStep("login");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password || password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setAuthError(error.message);
      } else {
        notify("Password updated successfully! Please log in with your new password.");
        setStep("login");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="onboarding-shell">
    <header className="onboarding-header">
      <div className="brand"><span className="brand-mark"><Icon name="leaf" /></span><span>Kisan <b>Saathi</b></span></div>
      <LanguageSelect language={language} onChange={onLanguageChange} />
    </header>
    <div className="onboarding-layout">
      <aside className="onboarding-story">
        <img src={photos.farmer} alt="Farmers in field" />
        <div className="story-overlay"><span className="eyebrow">FARMING, MADE EASIER</span><h1>Everything your farm needs, in one place.</h1></div>
      </aside>
      <main className="onboarding-card">
        {step === "login" && authMode === "signup" && <>
          <div className="auth-card-heading"><div><span className="eyebrow">CREATE ACCOUNT</span><h1>Join Kisan Saathi</h1></div></div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#1f2937' }}>
              Select your role <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {roleOptions.map(item => {
                const isSelected = role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setRole(item.role);
                      setAuthError("");
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '12px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #2e7d32' : '1px solid #d1d5db',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      boxShadow: isSelected ? '0 2px 4px rgba(46, 125, 50, 0.15)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: isSelected ? '#166534' : '#374151' }}>
                      <Icon name={item.icon} size={20} />
                      <strong style={{ fontSize: '0.92rem' }}>{item.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.25 }}>{item.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="signup-fields">
            <div className="signup-section-header">
              <Icon name="user" size={16} /> Personal Details
            </div>

            <label className="full-field">
              Full Name <span style={{ color: '#d32f2f' }}>*</span>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={signup.fullName}
                onChange={e => setSignup({ ...signup, fullName: e.target.value, firstName: e.target.value.split(" ")[0], lastName: e.target.value.split(" ").slice(1).join(" ") })}
                required
              />
            </label>

            <label>
              Mail ID (Email) <span style={{ color: '#d32f2f' }}>*</span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Phone Number <span style={{ color: '#d32f2f' }}>*</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '0 8px', background: '#f0f5f1', border: '2px solid #d4e0d7', borderRight: 0, borderRadius: '12px 0 0 12px', height: '47px', display: 'flex', alignItems: 'center', fontWeight: 800, color: '#314e40', fontSize: '13px' }}>+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  style={{ borderRadius: '0 12px 12px 0' }}
                  value={signup.phone}
                  onChange={e => setSignup({ ...signup, phone: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>
            </label>

            <div className="signup-section-header">
              <Icon name="map" size={16} /> Address Details (Line by Line)
            </div>

            <label className="full-field">
              Address Line 1 <span style={{ color: '#d32f2f' }}>*</span>
              <input
                type="text"
                placeholder="House / Survey No., Building, Street / Road"
                value={signup.addressLine1}
                onChange={e => setSignup({ ...signup, addressLine1: e.target.value })}
                required
              />
            </label>

            <label className="full-field">
              Address Line 2 (Optional)
              <input
                type="text"
                placeholder="Area, Landmark, Post Office"
                value={signup.addressLine2}
                onChange={e => setSignup({ ...signup, addressLine2: e.target.value })}
              />
            </label>

            <label>
              Place / Village / Town <span style={{ color: '#d32f2f' }}>*</span>
              <input
                type="text"
                placeholder="e.g. Palakkad / Shirdi"
                value={signup.place}
                onChange={e => setSignup({ ...signup, place: e.target.value, city: e.target.value })}
                required
              />
            </label>

            <label>
              State <span style={{ color: '#d32f2f' }}>*</span>
              <select
                value={signup.state}
                onChange={e => setSignup({ ...signup, state: e.target.value })}
                required
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </label>

            <label className="full-field">
              Pincode <span style={{ color: '#d32f2f' }}>*</span>
              <input
                type="text"
                placeholder="e.g. 678001"
                maxLength={6}
                value={signup.pincode}
                onChange={e => setSignup({ ...signup, pincode: e.target.value.replace(/\D/g, '') })}
                required
              />
            </label>

            <div className="signup-section-header">
              <Icon name="shield" size={16} /> Security
            </div>

            <label>
              Password (min 6 chars) <span style={{ color: '#d32f2f' }}>*</span>
              <div className="password-input-wrap" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#168642' }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label>
              Confirm Password <span style={{ color: '#d32f2f' }}>*</span>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          </div>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="primary-action" disabled={loading} onClick={handleSignup}>
            {loading ? "Creating account..." : "Sign Up & Register"}
          </button>
          <button className="text-action" onClick={() => { setAuthError(""); setAuthMode("login"); }}>Already have an account? <b>Sign in</b></button>
        </>}

        {step === "login" && authMode === "login" && <>
          <div className="auth-card-heading"><div><span className="eyebrow">{text(language, "welcome")}</span><h1>{text(language, "signIn")}</h1></div></div>

          <div style={{ background: '#f8faf9', border: '1px solid #cce3d5', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              ⚡ Quick 1-Click Role Logins:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => { setEmail("lender@kisan.com"); setPassword("password123"); }}
                style={{ textAlign: 'left', padding: '6px 8px', background: '#fff', border: '1px solid #86efac', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}
              >
                <strong>🚜 Tool Lender</strong><br /><span style={{ color: '#6b7280' }}>lender@kisan.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("farmer@kisan.com"); setPassword("password123"); }}
                style={{ textAlign: 'left', padding: '6px 8px', background: '#fff', border: '1px solid #86efac', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}
              >
                <strong>🌾 Farmer</strong><br /><span style={{ color: '#6b7280' }}>farmer@kisan.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("worker@kisan.com"); setPassword("password123"); }}
                style={{ textAlign: 'left', padding: '6px 8px', background: '#fff', border: '1px solid #86efac', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}
              >
                <strong>👷 Labourer</strong><br /><span style={{ color: '#6b7280' }}>worker@kisan.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("storage@kisan.com"); setPassword("password123"); }}
                style={{ textAlign: 'left', padding: '6px 8px', background: '#fff', border: '1px solid #86efac', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}
              >
                <strong>🏭 Storage Owner</strong><br /><span style={{ color: '#6b7280' }}>storage@kisan.com</span>
              </button>
            </div>
          </div>

          <div className="signup-fields">
            <label>Email address<input type="email" placeholder="farmer@example.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
            <label>Password
              <div className="password-input-wrap" style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="primary-action" disabled={loading} onClick={handleLogin}>
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <button className="text-action" onClick={() => { setAuthError(""); setStep("forgotPassword"); }}>Forgot password?</button>
            <button className="text-action signup-link" onClick={() => { setAuthError(""); setAuthMode("signup"); }}>New here? <b>Create an account</b></button>
          </div>
        </>}

        {step === "emailSent" && <>
          <div className="center-heading">
            <h1>Check your email</h1>
            <p>We've sent a verification email to <b>{emailSentTo}</b>.</p>
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
              Please click the link in your email to verify your account, then return here to log in.
            </p>
          </div>
          <button className="primary-action" disabled={loading} onClick={handleResendVerification}>
            {loading ? "Sending..." : "Resend verification email"}
          </button>
          <button className="text-action" onClick={() => { setAuthError(""); setStep("login"); setAuthMode("login"); }} style={{ marginTop: '12px' }}>
            Back to Sign In
          </button>
        </>}

        {step === "forgotPassword" && <>
          <button className="back-button" onClick={() => { setAuthError(""); setStep("login"); }}>‹ Back to login</button>
          <div className="center-heading">
            <h1>Reset your password</h1>
            <p>Enter your registered email address and we'll send you a password reset link.</p>
          </div>
          <div className="signup-fields">
            <label>Email address<input type="email" placeholder="farmer@example.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
          </div>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="primary-action" disabled={loading} onClick={handleForgotPassword}>
            {loading ? "Sending link..." : "Send Password Reset Email"}
          </button>
        </>}

        {step === "resetPassword" && <>
          <div className="center-heading">
            <h1>Set new password</h1>
            <p>Enter your new password below.</p>
          </div>
          <div className="signup-fields">
            <label>New Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
            <label>Confirm New Password<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></label>
          </div>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="primary-action" disabled={loading} onClick={handleUpdatePassword}>
            {loading ? "Updating..." : "Update Password & Log In"}
          </button>
        </>}
      </main>
    </div>
  </div>;
}

const getNavItemsForRole = (role: UserRole) => {
  if (role === "Tool Lender") {
    return [
      { id: "lender_home", labelKey: "dashboard", icon: "home" as IconName },
      { id: "lender_equipment", labelKey: "equipment", icon: "tractor" as IconName },
      { id: "lender_bookings", labelKey: "requests", icon: "clock" as IconName },
      { id: "profile", labelKey: "profile", icon: "user" as IconName },
    ];
  }
  if (role === "Job Seeker") {
    return [
      { id: "labour_home", labelKey: "dashboard", icon: "home" as IconName },
      { id: "labour_skills", labelKey: "skills", icon: "tool" as IconName },
      { id: "labour_jobs", labelKey: "jobs", icon: "briefcase" as IconName },
      { id: "labour_applications", labelKey: "applications", icon: "clock" as IconName },
      { id: "profile", labelKey: "profile", icon: "user" as IconName },
    ];
  }
  if (role === "Storage Owner") {
    return [
      { id: "storage_home", labelKey: "dashboard", icon: "home" as IconName },
      { id: "storage_facilities", labelKey: "facilities", icon: "warehouse" as IconName },
      { id: "storage_requests", labelKey: "requests", icon: "clock" as IconName },
      { id: "profile", labelKey: "profile", icon: "user" as IconName },
    ];
  }
  // Default Farmer
  return [
    { id: "home", labelKey: "home", icon: "home" as IconName },
    { id: "market", labelKey: "equipment", icon: "tractor" as IconName },
    { id: "workers", labelKey: "workers", icon: "users" as IconName },
    { id: "farmer_storage", labelKey: "storage", icon: "warehouse" as IconName },
    { id: "requests", labelKey: "requests", icon: "clock" as IconName },
    { id: "schemes", labelKey: "schemes", icon: "shield" as IconName },
    { id: "profile", labelKey: "profile", icon: "user" as IconName },
  ];
};

const getDefaultPageForRole = (role: UserRole) => {
  if (role === "Tool Lender") return "lender_home";
  if (role === "Job Seeker") return "labour_home";
  if (role === "Storage Owner") return "storage_home";
  return "home";
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState("home");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [toast, setToast] = useState("");
  const [profile, setProfile] = useState<OnboardingProfile>({ role: "Farmer", answers: {} });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isResetPasswordFlow, setIsResetPasswordFlow] = useState(false);
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3500); };

  const loadUserProfile = async (userId: string) => {
    try {
      const dbProf = await fetchProfile(userId);
      if (dbProf) {
        const canonicalRole = normalizeRole(dbProf.role);
        setProfile(prev => ({
          ...prev,
          role: canonicalRole,
          dbProfile: dbProf,
        }));
      }
    } catch (err) {
      console.warn("Could not load user profile:", err);
    } finally {
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    // Check if recovery link hash is present
    if (window.location.hash.includes("type=recovery") || window.location.hash.includes("reset-password")) {
      setIsResetPasswordFlow(true);
    }

    // 1. Check local persistent session first
    const active = localDb.getActiveSession();
    if (active && active.user && active.profile) {
      const canonicalRole = normalizeRole(active.profile.role);
      const restoredProf: OnboardingProfile = {
        ...active.profile,
        role: canonicalRole,
      };
      setUser(active.user);
      setProfile(restoredProf);
      setProfileLoaded(true);
      setAuthenticated(true);
      setPage(getDefaultPageForRole(canonicalRole));
      return;
    }

    // 2. Check Supabase if configured
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setAuthenticated(true);
          loadUserProfile(session.user.id);
        } else {
          setProfileLoaded(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsResetPasswordFlow(true);
        }

        if (session?.user) {
          setUser(session.user);
          setAuthenticated(true);
          loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setAuthenticated(false);
          setProfileLoaded(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const roleNavItems = getNavItemsForRole(profile.role);
  const defaultPage = getDefaultPageForRole(profile.role);

  useEffect(() => {
    if (authenticated) {
      const validNavs = getNavItemsForRole(profile.role);
      if (!validNavs.some(n => n.id === page)) {
        setPage(getDefaultPageForRole(profile.role));
      }
    }
  }, [profile.role, authenticated, page]);

  const handleLogout = async () => {
    localDb.clearActiveSession();
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => { });
    }
    setAuthenticated(false);
    setUser(null);
    setProfile({ role: "Farmer", answers: {} });
    setProfileLoaded(false);
    setPage("home");
    notify("Logged out successfully.");
  };

  if (isResetPasswordFlow) {
    return <Onboarding
      language={language}
      onLanguageChange={setLanguage}
      notify={notify}
      initialStep="resetPassword"
      onComplete={(completedProfile, authUser) => {
        setIsResetPasswordFlow(false);
        const canonicalRole = normalizeRole(completedProfile.role);
        const resolvedProf: OnboardingProfile = {
          ...completedProfile,
          role: canonicalRole,
        };
        setProfile(resolvedProf);
        if (resolvedProf.dbProfile) {
          setProfileLoaded(true);
        }
        setUser(authUser);
        localDb.setActiveSession({ user: authUser, profile: resolvedProf });
        setPage(getDefaultPageForRole(canonicalRole));
        setAuthenticated(true);
      }}
    />;
  }

  if (!authenticated) {
    return <Onboarding
      language={language}
      onLanguageChange={setLanguage}
      notify={notify}
      onComplete={(completedProfile, authUser) => {
        const canonicalRole = normalizeRole(completedProfile.role);
        const resolvedProf: OnboardingProfile = {
          ...completedProfile,
          role: canonicalRole,
        };
        setProfile(resolvedProf);
        if (resolvedProf.dbProfile) {
          setProfileLoaded(true);
        }
        setUser(authUser);
        localDb.setActiveSession({ user: authUser, profile: resolvedProf });
        setPage(getDefaultPageForRole(canonicalRole));
        setAuthenticated(true);
        notify("Welcome to Kisan Saathi!");
      }}
    />;
  }

  const showPersonalizationModal =
    authenticated &&
    Boolean(user) &&
    profileLoaded &&
    Boolean(profile.dbProfile) &&
    profile.dbProfile.onboarding_completed === false &&
    onboardingSkipped === false;

  return <div className="app-shell">
    {showPersonalizationModal && (
      <PersonalizationOnboardingModal
        user={user}
        profile={profile}
        notify={notify}
        language={language}
        onComplete={() => {
          if (user?.id) loadUserProfile(user.id);
        }}
        onSkip={() => setOnboardingSkipped(true)}
      />
    )}

    <aside className="desktop-sidebar">
      <button className="brand" onClick={() => setPage(defaultPage)}><span className="brand-mark"><Icon name="leaf" /></span><span>Kisan<br /><b>Saathi</b></span></button>
      <nav>{roleNavItems.map(item => <button className={page === item.id ? "active" : ""} key={item.id} onClick={() => setPage(item.id)}><Icon name={item.icon} /><span>{text(language, item.labelKey)}</span></button>)}</nav>
    </aside>
    <div className="app-main">
      <header className="topbar">
        <button className="brand mobile-brand" onClick={() => setPage(defaultPage)}><span className="brand-mark"><Icon name="leaf" /></span><span>Kisan <b>Saathi</b></span></button>
        <div className="top-actions">
          <LanguageSelect language={language} onChange={setLanguage} />
          {profile.role !== "Farmer" && (
            <button className="notification-btn" aria-label="Notifications" onClick={() => {
              if (profile.role === "Tool Lender") setPage("lender_bookings");
              else if (profile.role === "Storage Owner") setPage("storage_requests");
              else if (profile.role === "Job Seeker") setPage("labour_applications");
              else setPage("requests");
            }}><Icon name="bell" /><i>1</i></button>
          )}
          <button className="profile-chip" onClick={() => setPage("profile")}>
            <img src={profile.dbProfile?.avatar_url || photos.farmer} alt="" style={{ objectFit: 'cover' }} />
            <span>{profile.account?.fullName?.split(" ")[0] || profile.account?.firstName || profile.dbProfile?.full_name?.split(" ")[0] || "User"}<small>{profile.role}</small></span>
          </button>
        </div>
      </header>

      {/* FARMER PAGES */}
      {page === "home" && <Dashboard notify={notify} go={setPage} profile={profile} language={language} />}
      {page === "market" && <Marketplace notify={notify} user={user} language={language} />}
      {page === "workers" && profile.role === "Farmer" && <Workers notify={notify} />}
      {page === "farmer_storage" && <FarmerStorageBrowse notify={notify} user={user} />}
      {page === "schemes" && <GovernmentSchemes profile={profile} language={language} notify={notify} />}

      {/* TOOL LENDER PAGES */}
      {page === "lender_home" && <ToolLenderDashboard notify={notify} go={setPage} profile={profile} user={user} />}
      {page === "lender_equipment" && <ToolLenderEquipment notify={notify} profile={profile} user={user} />}
      {page === "lender_bookings" && <ToolLenderBookings notify={notify} profile={profile} user={user} />}

      {/* LABOURER / JOB SEEKER PAGES */}
      {page === "labour_home" && <LabourerDashboard notify={notify} go={setPage} profile={profile} user={user} />}
      {page === "labour_skills" && <LabourerSkillsManage notify={notify} profile={profile} user={user} onProfileUpdated={() => user?.id && loadUserProfile(user.id)} />}
      {page === "labour_jobs" && <LabourerJobsFeed notify={notify} profile={profile} user={user} />}
      {page === "labour_applications" && <LabourerApplications notify={notify} profile={profile} user={user} />}

      {/* STORAGE OWNER PAGES */}
      {page === "storage_home" && <StorageOwnerDashboard notify={notify} go={setPage} profile={profile} user={user} />}
      {page === "storage_facilities" && <StorageOwnerFacilities notify={notify} profile={profile} user={user} />}
      {page === "storage_requests" && <StorageOwnerRequests notify={notify} profile={profile} user={user} />}

      {/* SHARED PAGES */}
      {page === "jobs" && <Jobs notify={notify} user={user} language={language} />}
      {page === "requests" && <Requests notify={notify} profile={profile} user={user} />}
      {page === "profile" && <Profile profile={profile} notify={notify} language={language} onLogout={handleLogout} user={user} onProfileUpdated={() => user?.id && loadUserProfile(user.id)} />}
    </div>
    {toast && <div className="toast"><Icon name="check" />{toast}</div>}
    <nav className="bottom-nav">{roleNavItems.map(item => <button className={page === item.id ? "active" : ""} key={item.id} onClick={() => setPage(item.id)}><span><Icon name={item.icon} /></span><small>{text(language, item.labelKey)}</small></button>)}</nav>
  </div>;
}
