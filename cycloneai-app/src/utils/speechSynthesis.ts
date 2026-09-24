/**
 * Multilingual Speech Synthesis for Coastal Cyclone Awareness
 * Uses Web Speech API (speechSynthesis) with Web Audio acoustic attention chime.
 */

export interface CoastalLanguage {
  id: 'or' | 'bn' | 'hi' | 'te' | 'ta' | 'en';
  name: string;
  nativeName: string;
  region: string;
  langCode: string;
  flagIcon: string;
}

export const COASTAL_LANGUAGES: CoastalLanguage[] = [
  {
    id: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    region: 'Odisha Coast (Kendrapara, Bhadrak, Balasore, Jagatsinghpur, Puri)',
    langCode: 'or-IN',
    flagIcon: '🌊'
  },
  {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal Coast (Digha, Sundarbans, East Midnapore, Sagar Island)',
    langCode: 'bn-IN',
    flagIcon: '🐚'
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'National / NDRF Coastal Public Address & Police Siren Vehicles',
    langCode: 'hi-IN',
    flagIcon: '📢'
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Andhra Pradesh Coast (Visakhapatnam, Kakinada, Srikakulam)',
    langCode: 'te-IN',
    flagIcon: '⚓'
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Tamil Nadu & Puducherry Coastline',
    langCode: 'ta-IN',
    flagIcon: '⛵'
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Maritime Radio, Ports & International Coastal Warning',
    langCode: 'en-IN',
    flagIcon: '🌐'
  }
];

export interface CycloneSpeechData {
  cycloneName: string;
  category: string;
  landfallLocation: string;
  surgeM: number;
  windKmh: number;
}

export interface GeneratedSpeechContent {
  headline: string;
  nativeScript: string;
  phoneticLatin: string;
  keyInstructions: string[];
}

/**
 * Generate culturally and linguistically authentic disaster awareness warnings for coastal residents
 */
export function generateSpeechForLanguage(
  langId: CoastalLanguage['id'],
  data: CycloneSpeechData
): GeneratedSpeechContent {
  const { cycloneName, category, landfallLocation, surgeM, windKmh } = data;

  switch (langId) {
    case 'or': // Odia
      return {
        headline: `ବାତ୍ୟା ${cycloneName} ଜରୁରୀ ସତର୍କ ସୂଚନା!`,
        nativeScript: `ଜରୁରୀ ସୂଚନା! ଭୀଷଣ ବାତ୍ୟା ${cycloneName} ସମୁଦ୍ରରୁ ଉପକୂଳ ଆଡ଼କୁ ଦ୍ରୁତ ଗତିରେ ମାଡ଼ି ଆସୁଛି। ପବନର ବେଗ ଘଣ୍ଟା ପ୍ରତି ${windKmh} କିଲୋମିଟର ପର୍ଯ୍ୟନ୍ତ ବୃଦ୍ଧି ପାଇବ। ${landfallLocation} ନିକଟରେ ସ୍ଥଳଭାଗ ଛୁଇଁବାର ସମ୍ଭାବନା ଅଛି। ସମୁଦ୍ରରେ ${surgeM} ମିଟର ପର୍ଯ୍ୟନ୍ତ ଉଚ୍ଚ ଜୁଆର ଆସିପାରେ। କଚ୍ଚା ଘରେ ରହୁଥିବା ସମସ୍ତ ଲୋକ ତୁରନ୍ତ ନିକଟସ୍ଥ ସରକାରୀ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଚାଲିଯାଆନ୍ତୁ। ମତ୍ସ୍ୟଜୀବୀମାନେ ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ। ଶୁଖିଲା ଖାଦ୍ୟ, ପିଇବା ପାଣି ଏବଂ ଜରୁରୀ ଔଷଧ ସାଙ୍ଗରେ ରଖନ୍ତୁ। ଜରୁରୀ ସହାୟତା ପାଇଁ ଏକ ଶହ ସତୂରି ନମ୍ବର କିମ୍ବା ଏକ ଶହ ବାର ଡାଏଲ କରନ୍ତୁ।`,
        phoneticLatin: `Jaruri Soochana! Bheeshana Baatyaa ${cycloneName} samudraru upakula aadu druta gatire maadi aasuchhi. Pabanara bega ghantaa prati ${windKmh} kilometer parjyanta brudhi paaiba. ${landfallLocation} nikature sthalabhaaga chhuinbaara sambhaabanaa achhi. Samudrare ${surgeM} meter parjyanta uchha juaara aasipaare. Kachha ghare rahuthibaa samasta loka turanta nikatastha sarkari baatyaa aashrayasthaliku chaalijaantu. Matsyajeebeemaane samudraku jaantu naahin. Shukhilaa khaadya, pieebaa paani ebang jaruri aushadha saangare rakhantu. Helpline paain 1070 baa 112 dial karantu.`,
        keyInstructions: [
          'ତୁରନ୍ତ ପକ୍କା ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ (Evacuate to pucca shelters immediately)',
          'ସମୁଦ୍ର କୂଳ ଓ ତଳିଆ ଅଞ୍ଚଳ ଖାଲି କରନ୍ତୁ (Evacuate shoreline within 5 km)',
          'ମତ୍ସ୍ୟଜୀବୀମାନେ କୌଣସି ପରିସ୍ଥିତିରେ ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ (Fishermen must not enter sea)',
          'ଜରୁରୀ ହେଲ୍ପଲାଇନ୍: ୧୦୭୦ (NDMA) / ୧୧୨ (Emergency)'
        ]
      };

    case 'bn': // Bengali
      return {
        headline: `ঘূর্ণিঝড় ${cycloneName} জরুরি উপকূলীয় সতর্কতা!`,
        nativeScript: `জরুরি সতর্কবার্তা! প্রবল ঘূর্ণিঝড় ${cycloneName} তীব্র গতিতে উপকূলের দিকে ধেয়ে আসছে। বাতাসের গতিবেগ ঘণ্টায় সর্বোচ্চ ${windKmh} কিলোমিটার পর্যন্ত পৌঁছাতে পারে। ${landfallLocation} উপকূলে আছড়ে পড়ার প্রবল সম্ভাবনা রয়েছে। সমুদ্রে ${surgeM} মিটার পর্যন্ত উচ্চ জলোচ্ছ্বাসের আশঙ্কা রয়েছে। মাটির বাড়ি ও নিচু এলাকার বাসিন্দারা অবিলম্বে নিকটবর্তী বহুমুখী সাইক্লোন আশ্রয়কেন্দ্রে চলে যান। মৎস্যজীবীরা অবিলম্বে সমুদ্রে যাওয়া বন্ধ রাখুন এবং নিরাপদ আশ্রয়ে থাকুন। পানীয় জল, শুকনো খাবার এবং জরুরি ওষুধ সাথে রাখুন। জরুরি সহায়তার জন্য ১০৭০ অথবা ১১২ নম্বরে ফোন করুন।`,
        phoneticLatin: `Jaruri Satarkabarta! Probol Ghurnijhor ${cycloneName} teebro gotite upokuler dike dheye aaschhe. Bataser gotibeg ghontay ${windKmh} kilometer porjonto pouchhate pare. ${landfallLocation} upokule aanchhde podar sombhabona royechhe. Somudre ${surgeM} meter porjonto jolo-chchhwas hote pare. Kachha bari o nichu elakar basindara obilombe cyclone ashroykendrey chole jaan. Motsojeebira somudre jaowa bondho rakhun. Emergency helpline 1070 ba 112 phone korun.`,
        keyInstructions: [
          'অবিলম্বে নিকটবর্তী সাইক্লোন সেন্টারে আশ্রয় নিন (Move to nearest cyclone center)',
          'উপকূলীয় বাঁধ ও নিচু এলাকা খালি করুন (Evacuate coastal lowlands)',
          'মৎস্যজীবীদের সমুদ্রে যেতে কঠোর নিষেধাজ্ঞা (Strict ban on sea fishing)',
          'জরুরি হেল্পলাইন: ১০৭০ (Disaster Control) / ১১২'
        ]
      };

    case 'hi': // Hindi
      return {
        headline: `चक्रवात ${cycloneName} तटीय आपातकालीन चेतावनी!`,
        nativeScript: `सावधान! अत्यंत गंभीर चक्रवाती तूफान ${cycloneName} तेजी से तटीय इलाकों की तरफ बढ़ रहा है। हवा की रफ्तार ${windKmh} किलोमीटर प्रति घंटा तक पहुंच सकती है। इसके ${landfallLocation} के पास तट से टकराने की पूरी संभावना है। समुद्र में ${surgeM} मीटर ऊंची विनाशकारी लहरें उठ सकती हैं। कच्चे घरों और निचले इलाकों में रहने वाले सभी नागरिक तुरंत नजदीकी सरकारी चक्रवात आश्रय स्थल में पहुंचें। मछुआरे समुद्र में बिल्कुल न जाएं। पीने का पानी, सूखा भोजन और जरूरी दवाइयां सुरक्षित साथ रखें। सहायता के लिए आपदा हेल्पलाइन 1070 या 112 पर तुरंत संपर्क करें।`,
        phoneticLatin: `Saavdhan! Atyant gambheer chakrawati toofaan ${cycloneName} tezi se tateeya ilaaqon ki taraf badh raha hai. Hawa ki raftaar ${windKmh} kilometer prati ghanta tak pahunch sakti hai. Iske ${landfallLocation} ke paas tat se takrane ki poori sambhawna hai. Samudra me ${surgeM} meter oonchi laherein uth sakti hain. Sabhi log turant nazdeeki cyclone shelter me jayein. Machhuare samudra me bilkul na jayein. Helpline 1070 ya 112 par call karein.`,
        keyInstructions: [
          'तुरंत पक्के चक्रवात आश्रय गृह में पहुंचे (Shift to cyclone shelters immediately)',
          'तटवर्ती 5 किलोमीटर क्षेत्र से सुरक्षित दूरी बनाएं (Evacuate 5 km coastline buffer)',
          'समुद्र में नौकाएं न उतारें (Strict ban on all coastal maritime movement)',
          'आपदा कंट्रोल रूम: 1070 / राष्ट्रीय आपातकाल 112'
        ]
      };

    case 'te': // Telugu
      return {
        headline: `తీవ్ర తుపాను ${cycloneName} తీరప్రాంత హెచ్చరిక!`,
        nativeScript: `ప్రజలకు అత్యవసర హెచ్చరిక! తీవ్ర తుపాను ${cycloneName} తీరప్రాంతం వైపు వేగంగా దూసుకొస్తోంది. గాలి వేగం గంటకు ${windKmh} కిలోమీటర్ల వరకు పెరిగే అవకాశం ఉంది. ${landfallLocation} వద్ద తుపాను తీరం దాటనుంది. సముద్రంలో ${surgeM} మీటర్ల ఎత్తున అలలు విరుచుకుపడతాయి. లోతట్టు ప్రాంతాలు మరియు తీరప్రాంత ప్రజలు వెంటనే సమీపంలోని పునరావాస కేంద్రాలకు తరలివెళ్లండి. మత్స్యకారులు వేటకు వెళ్లరాదు. తాగునీరు, ఎండు ఆహారం వెంట ఉంచుకోండి. అత్యవసర సహాయం కోసం 1070 లేదా 112 నంబర్ కు కాల్ చేయండి.`,
        phoneticLatin: `Prajala-ku atyavasara hecharika! Tevra tupaanu ${cycloneName} teerapraantam vaipu veganga doosukostondi. Gaali vegam gantaku ${windKmh} kilometarla varaku perige avakaasam undi. ${landfallLocation} daggara teeram daatanundi. Samudram lo ${surgeM} meeterla ettuna alalu lechhe pramaadam undi. Prajalu ventane cyclone rehabilitation center ku vellandi. Matsyakārulu vetaku vellaradu. Emergency helpline 1070 or 112 ku call cheyandi.`,
        keyInstructions: [
          'వెంటనే సురక్షిత తుపాను సహాయ కేంద్రాలకు వెళ్ళండి (Move to relief shelters now)',
          'సముద్రతీర లోతట్టు ప్రాంతాలను ఖాళీ చేయండి (Evacuate low-lying coast)',
          'మత్స్యకారులు సముద్రంలోకి వెళ్లవద్దు (Fishermen stay off the sea)',
          'అత్యవసర కాల్: 1070 / 112'
        ]
      };

    case 'ta': // Tamil
      return {
        headline: `புயல் ${cycloneName} அவசரக் கடலோர எச்சரிக்கை!`,
        nativeScript: `பொதுமக்கள் கவனத்திற்கு! தீவிர புயல் ${cycloneName} வேகமாக கடலோரப் பகுதியை நோக்கி நகர்ந்து வருகிறது. காற்றின் வேகம் மணிக்கு ${windKmh} கிலோமீட்டர் வரை வீசக்கூடும். ${landfallLocation} அருகே கரையைக் கடக்கும் என்று கணிக்கப்பட்டுள்ளது. கடல் அலைகள் ${surgeM} மீட்டர் வரை உயர்ந்து ஆக்ரோஷமாக எழக்கூடும். தாழ்வான பகுதிகள் மற்றும் கடலோர மக்கள் உடனடியாக அரசு புயல் பாதுகாப்பு மையங்களுக்கு செல்லுமாறு கேட்டுக்கொள்ளப்படுகிறார்கள். மீனவர்கள் கடலுக்குள் செல்லக் கூடாது. அவசர உதவிக்கு 1070 அல்லது 112 எண்ணை தொடர்பு கொள்ளவும்.`,
        phoneticLatin: `Podhumakkal kavanathirku! Theevira puyal ${cycloneName} vegamaaga kadalora pagudhiyai nokki nagarndhu varugiradhu. Kaatrin vegam manikku ${windKmh} kilometer varai veesakkoodum. ${landfallLocation} arugil karaiyai kadakkum enru kanikkappattulladhu. Kadal alaigal ${surgeM} meter varai uyaralaam. Makkal udanadiyaaga puyal paadhugaappu maiyangalukku sellavum. Meenavargal kadalukku sella koodaadhu. Helpline 1070 / 112.`,
        keyInstructions: [
          'உடனடியாக அரசு புயல் நிவாரண முகாம்களுக்கு செல்லவும் (Evacuate to relief shelters)',
          'கடலோர தாழ்வான பகுதிகளை காலி செய்யவும் (Move out of low-lying areas)',
          'மீனவர்கள் கடலுக்கு செல்ல வேண்டாம் (Do not venture into the sea)',
          'அவசர கட்டுப்பாட்டு அறை: 1070 / 112'
        ]
      };

    case 'en': // English
    default:
      return {
        headline: `Cyclone ${cycloneName} Emergency Coastal Siren Warning!`,
        nativeScript: `Emergency siren warning for all coastal communities! Severe Cyclone ${cycloneName} is advancing rapidly toward the coastline. Maximum sustained wind speeds are reaching up to ${windKmh} kilometers per hour. Landfall is projected near ${landfallLocation}. Catastrophic storm surge waves of up to ${surgeM} meters are expected to inundate low-lying saline lands. All residents in kachha dwellings within five kilometers of the coastline must evacuate immediately to designated multipurpose cyclone shelters. Total ban on maritime fishing. Carry clean drinking water, dry rations, and critical medical supplies. For search and rescue assistance, dial disaster helpline 1070 or emergency 112 immediately.`,
        phoneticLatin: `Emergency siren warning for all coastal communities! Severe Cyclone ${cycloneName} is advancing rapidly toward the coastline. Maximum sustained wind speeds are reaching up to ${windKmh} kilometers per hour. Landfall is projected near ${landfallLocation}. Catastrophic storm surge waves of up to ${surgeM} meters are expected to inundate low-lying saline lands. Evacuate immediately to designated multipurpose cyclone shelters. Total ban on maritime fishing. Dial disaster helpline 1070 or emergency 112.`,
        keyInstructions: [
          'Evacuate immediately to designated Multipurpose Cyclone Shelters',
          'Vacate shoreline buffer zone (0-5 km) prior to gale winds',
          'Strict maritime ban on all fishing boats and trawlers',
          'Emergency State Helplines: 1070 (Disaster) / 112 (Police/Ambulance)'
        ]
      };
  }
}

/**
 * Play a two-tone disaster attention gong through Web Audio API
 */
export function playAlertChimeGong(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        resolve();
        return;
      }
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High chime gong followed by lower harmonic
      const freqs = [880, 587.33];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.25);

        gain.gain.setValueAtTime(0.2, now + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.25);
        osc.stop(now + i * 0.25 + 0.65);
      });

      setTimeout(() => {
        try {
          ctx.close();
        } catch (e) {}
        resolve();
      }, 700);
    } catch (e) {
      resolve();
    }
  });
}

/**
 * Find the most suitable browser speech synthesis voice for a language
 */
export function findBestVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Exact match
  const exact = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;

  // Language prefix match (e.g., 'bn', 'hi', 'te', 'ta')
  const prefix = langCode.split('-')[0].toLowerCase();
  const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
  if (prefixMatch) return prefixMatch;

  // Indian English fallback for regional clarity
  const inEnglish = voices.find(v => v.lang.toLowerCase().includes('en-in'));
  if (inEnglish) return inEnglish;

  // Any English or default voice
  return voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
}

export interface SpeakOptions {
  languageId: CoastalLanguage['id'];
  cycloneData: CycloneSpeechData;
  speed?: number; // 0.8 to 1.2
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  playChime?: boolean;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speak coastal cyclone awareness alert in the selected language
 */
export async function speakCoastalAlert(options: SpeakOptions): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    throw new Error('Speech synthesis is not supported on this device/browser');
  }

  // Cancel any ongoing speech
  stopCoastalAlert();

  if (options.playChime !== false) {
    await playAlertChimeGong();
  }

  const langConfig = COASTAL_LANGUAGES.find(l => l.id === options.languageId) || COASTAL_LANGUAGES[0];
  const speechContent = generateSpeechForLanguage(options.languageId, options.cycloneData);

  // Check if browser has a native voice for this language
  const availableVoice = findBestVoiceForLanguage(langConfig.langCode);

  // If a native voice exists for this regional language, use native script.
  // If the browser only has English voices (common on some OS for Odia/Telugu), use phonetic Latin so it pronounces cleanly!
  const hasRegionalVoice = availableVoice && availableVoice.lang.toLowerCase().startsWith(langConfig.langCode.split('-')[0].toLowerCase());
  const textToSpeak = hasRegionalVoice ? speechContent.nativeScript : speechContent.phoneticLatin;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  activeUtterance = utterance;

  if (availableVoice) {
    utterance.voice = availableVoice;
  }
  utterance.lang = availableVoice?.lang || langConfig.langCode;
  utterance.rate = options.speed || 0.92; // Slightly measured pace for emergency broadcast clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    if (options.onError) options.onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any current speech synthesis
 */
export function stopCoastalAlert(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch (e) {}
  }
}

/**
 * Check if speech is currently playing
 */
export function isCoastalAlertSpeaking(): boolean {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
