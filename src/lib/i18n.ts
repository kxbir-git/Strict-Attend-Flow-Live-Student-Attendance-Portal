export type LanguageCode = "en" | "hi" | "mr" | "ta" | "te" | "bn";

export interface Translations {
  [key: string]: {
    [lang in LanguageCode]: string;
  };
}

export const translations: Translations = {
  portalTitle: {
    en: "Strict Attend Flow",
    hi: "स्ट्रिक्ट अटेंड फ्लो",
    mr: "स्ट्रिक्ट अटेंड फ्लो",
    ta: "ஸ்ட்ரிக்ட் அட்டெண்ட் ஃப்ளோ",
    te: "స్ట్రిక్ట్ అటెండ్ ఫ్లో",
    bn: "স্ট্রিক্ট অ্যাটেন্ড ফ্লো",
  },
  dashboard: {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    mr: "डॅशबोर्ड",
    ta: "டாஷ்போர்டு",
    te: "డాష్‌బోర్డ్",
    bn: "ড্যাশবোর্ড",
  },
  liveMarking: {
    en: "Live Marking",
    hi: "लाइव हाजिरी",
    mr: "लाइव्ह उपस्थिती",
    ta: "நேரடி வருகை",
    te: "లైవ్ హాజరు",
    bn: "লাইভ উপস্থিতি",
  },
  history: {
    en: "Attendance History",
    hi: "उपस्थिति इतिहास",
    mr: "उपस्थिती इतिहास",
    ta: "வருகை வரலாறு",
    te: "హాజరు చరిత్ర",
    bn: "উপস্থিতির ইতিহাস",
  },
  profile: {
    en: "My Profile",
    hi: "मेरी प्रोफाइल",
    mr: "माझी प्रोफाइल",
    ta: "என் சுயவிவரம்",
    te: "నా ప్రొఫైల్",
    bn: "আমার প্রোফাইল",
  },
  leave: {
    en: "Apply Leave",
    hi: "अवकाश आवेदन",
    mr: "रजेचा अर्ज",
    ta: "விடுப்பு விண்ணப்பம்",
    te: "సెలవు దరఖాస్తు",
    bn: "ছুটির আবেদন",
  },
  certificate: {
    en: "Certificate",
    hi: "प्रमाणपत्र",
    mr: "प्रमाणपत्र",
    ta: "சான்றிதழ்",
    te: "ధృవీకరణ పత్రం",
    bn: "শংসাপত্র",
  },
  assistant: {
    en: "AI Assistant",
    hi: "एआई सहायक",
    mr: "एआय सहाय्यक",
    ta: "AI உதவியாளர்",
    te: "AI అసిస్టెంట్",
    bn: "এআই সহকারী",
  },
  calendar: {
    en: "Calendar & Schedule",
    hi: "कैलेंडर व समय सारिणी",
    mr: "कॅलेंडर व वेळापत्रक",
    ta: "நாட்காட்டி மற்றும் அட்டவணை",
    te: "క్యాలెండర్ మరియు షెడ్యూల్",
    bn: "ক্যালেন্ডার ও সময়সূচী",
  },
  achievements: {
    en: "Streaks & Badges",
    hi: "स्ट्रिक्स और बैज",
    mr: "स्ट्रीक्स आणि बॅजेस",
    ta: "ஸ்ட்ரீக்ஸ் மற்றும் பேட்ஜ்கள்",
    te: "స్ట్రీక్స్ మరియు బ్యాడ్జ్‌లు",
    bn: "স্ট্রিক ও ব্যাজ",
  },
  settings: {
    en: "Settings",
    hi: "सेटिंग्स",
    mr: "सेटिंग्ज",
    ta: "அமைப்புகள்",
    te: "సెట్టింగ్‌లు",
    bn: "সেটিংস",
  },
  notifications: {
    en: "Notifications",
    hi: "सूचनाएं",
    mr: "सूचना",
    ta: "அறிவிப்புகள்",
    te: "నోటిఫికేషన్లు",
    bn: "বিজ্ঞপ্তি",
  },
  overallAttendance: {
    en: "Overall Attendance",
    hi: "कुल उपस्थिति",
    mr: "एकूण उपस्थिती",
    ta: "மொத்த வருகை",
    te: "మొత్తం హాజరు",
    bn: "সামগ্রিক উপস্থিতি",
  },
  present: {
    en: "Present",
    hi: "उपस्थित",
    mr: "हजर",
    ta: "வந்தார்",
    te: "హాజరు",
    bn: "উপস্থিত",
  },
  absent: {
    en: "Absent",
    hi: "अनुपस्थित",
    mr: "गैरहजर",
    ta: "வரவில்லை",
    te: "గైర్హాజరు",
    bn: "অনুপস্থিত",
  },
  late: {
    en: "Late",
    hi: "देर से",
    mr: "उशिरा",
    ta: "தாமதமாக",
    te: "ఆలస్యంగా",
    bn: "দেরি",
  },
  approvedLeave: {
    en: "Approved Leave",
    hi: "स्वीकृत अवकाश",
    mr: "मंजूर रजा",
    ta: "அங்கீகரிக்கப்பட்ட விடுப்பு",
    te: "ఆమోదించబడిన సెలవు",
    bn: "অনুমোদিত ছুটি",
  },
  safeBuffer: {
    en: "Attendance Buffer",
    hi: "अटेंडेंस बफर (सुरक्षित छुट्टियां)",
    mr: "उपस्थिती बफर",
    ta: "வருகை பாதுகாப்பு தாங்கல்",
    te: "హాజరు బఫర్",
    bn: "উপস্থিতি বাফার",
  },
  defaulterAlert: {
    en: "Defaulter Warning: Attendance below 75%",
    hi: "चेतावनी: उपस्थिति 75% से कम है",
    mr: "चेतावणी: उपस्थिती 75% पेक्षा कमी आहे",
    ta: "எச்சரிக்கை: வருகை 75% க்கும் குறைவாக உள்ளது",
    te: "హెచ్చరిక: హాజరు 75% కంటే తక్కువగా ఉంది",
    bn: "সতর্কতা: উপস্থিতি ৭৫% এর নিচে",
  },
  signOut: {
    en: "Sign Out",
    hi: "लॉग आउट",
    mr: "बाहेर पडा",
    ta: "வெளியேறு",
    te: "లాగ్ అవుట్",
    bn: "লগ আউট",
  },
};

export function getTranslation(key: string, lang: LanguageCode = "en"): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return translations[key]?.en || key;
}
