import React, { useState } from 'react';
import { GovernmentScheme, Profile } from '../types/database';
import { matchSchemeForProfile } from '../lib/schemeMatching';
import { SpeakButton } from './SpeakButton';
import { VoiceInputButton } from './VoiceInputButton';
import { OfficialApplyButton } from './OfficialApplyButton';

interface SchemeEligibilityQuizProps {
  scheme: GovernmentScheme;
  profile: Profile | null;
  language?: string;
  onClose: () => void;
  onUpdateProfile?: () => void;
}

interface Question {
  id: string;
  textKey: string;
  questionText: Record<string, string>;
  options: { label: Record<string, string>; value: string | boolean }[];
}

const QUIZ_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: 'Can I Apply For This Scheme?',
    subtitle: 'Answer a few quick questions to determine your eligibility.',
    questionLabel: 'Question',
    readAloud: 'Read Question Aloud',
    voiceAnswerHint: 'Or answer using voice command (e.g. "Yes", "No")',
    yes: 'Yes',
    no: 'No',
    notSure: 'Not Sure',
    next: 'Next Question',
    previous: 'Previous',
    checkEligibility: 'Check My Eligibility',
    resultTitle: 'Eligibility Assessment Result',
    eligible: 'You Appear Eligible!',
    partiallyEligible: 'Needs Profile Confirmation',
    notEligible: 'Criteria Mismatch',
    reasonsHeader: 'Matched Criteria:',
    missingHeader: 'Still Needs Confirmation:',
    officialApplyHint: 'You meet the primary criteria! You can apply on the official government portal:',
    updateProfileHint: 'Update your profile details to complete verification:',
    updateProfileBtn: 'Go to Profile Setup',
    close: 'Close Quiz',
  },
  hi: {
    title: 'क्या मैं इस योजना के लिए आवेदन कर सकता हूं?',
    subtitle: 'अपनी पात्रता निर्धारित करने के लिए कुछ प्रश्नों के उत्तर दें।',
    questionLabel: 'प्रश्न',
    readAloud: 'प्रश्न जोर से सुनें',
    voiceAnswerHint: 'या आवाज कमांड से उत्तर दें (जैसे "हाँ", "नहीं")',
    yes: 'हाँ',
    no: 'नहीं',
    notSure: 'पक्का नहीं',
    next: 'अगला प्रश्न',
    previous: 'पिछला',
    checkEligibility: 'मेरी पात्रता जांचें',
    resultTitle: 'पात्रता मूल्यांकन परिणाम',
    eligible: 'आप पात्र प्रतीत होते हैं!',
    partiallyEligible: 'प्रोफाइल पुष्टि की आवश्यकता है',
    notEligible: 'मानदंड मेल नहीं खाते',
    reasonsHeader: 'सत्यापित मानदंड:',
    missingHeader: 'पुष्टि की आवश्यकता है:',
    officialApplyHint: 'आप मुख्य मानदंडों को पूरा करते हैं! आधिकारिक सरकारी पोर्टल पर आवेदन करें:',
    updateProfileHint: 'सत्यापन पूरा करने के लिए अपनी प्रोफाइल अपडेट करें:',
    updateProfileBtn: 'प्रोफाइल पर जाएं',
    close: 'क्विज बंद करें',
  },
  ml: {
    title: 'എനിക്ക് ഈ പദ്ധതിക്ക് അപേക്ഷിക്കാമോ?',
    subtitle: 'നിങ്ങളുടെ യോഗ്യത അറിയാൻ ലളിതമായ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക.',
    questionLabel: 'ചോദ്യം',
    readAloud: 'ചോദ്യം കേൾക്കുക',
    voiceAnswerHint: 'അല്ലെങ്കിൽ ശബ്ദ സന്ദേശം ഉപയോഗിച്ച് മറുപടി നൽകുക (ഉദാ: "അതെ", "ഇല്ല")',
    yes: 'അതെ',
    no: 'ഇല്ല',
    notSure: 'ഉറപ്പില്ല',
    next: 'അടുത്ത ചോദ്യം',
    previous: 'മുമ്പത്തേത്',
    checkEligibility: 'എന്റെ യോഗ്യത പരിശോധിക്കുക',
    resultTitle: 'യോഗ്യത പരിശോധനാ ഫലം',
    eligible: 'നിങ്ങൾക്ക് അപേക്ഷിക്കാം!',
    partiallyEligible: 'പ്രൊഫൈൽ സ്ഥിരീകരണം ആവശ്യമാണ്',
    notEligible: 'യോഗ്യതാ മാനദണ്ഡങ്ങൾ ചേരുന്നില്ല',
    reasonsHeader: 'അംഗീകരിച്ച കാര്യങ്ങൾ:',
    missingHeader: 'ഉറപ്പാക്കേണ്ട കാര്യങ്ങൾ:',
    officialApplyHint: 'നിങ്ങൾ പ്രധാന യോഗ്യതകൾ പൂര്ത്തിയാക്കുന്നു! ഔദ്യോഗിക പോർട്ടലിൽ അപേക്ഷിക്കാം:',
    updateProfileHint: 'വിവരങ്ങൾ നൽകാൻ പ്രൊഫൈൽ പുതുക്കുക:',
    updateProfileBtn: 'പ്രൊഫൈലിലേക്ക് പോകുക',
    close: 'അടയ്ക്കുക',
  },
  ta: {
    title: 'நான் இந்த திட்டத்திற்கு விண்ணப்பிக்கலாமா?',
    subtitle: 'உங்கள் தகுதியைத் தீர்மானிக்க சில கேள்விகளுக்குப் பதிலளிக்கவும்.',
    questionLabel: 'கேள்வி',
    readAloud: 'கேள்வியை சத்தமாகக் கேட்கவும்',
    voiceAnswerHint: 'அல்லது குரல் கட்டளை மூலம் பதிலளிக்கவும் (எ.கா. "ஆம்", "இல்லை")',
    yes: 'ஆம்',
    no: 'இல்லை',
    notSure: 'நிச்சயமில்லை',
    next: 'அடுத்த கேள்வி',
    previous: 'முந்தையது',
    checkEligibility: 'எனது தகுதியை சரிபார்க்கவும்',
    resultTitle: 'தகுதி மதிப்பீட்டு முடிவு',
    eligible: 'நீங்கள் தகுதியுடையவராகத் தோன்றுகிறீர்கள்!',
    partiallyEligible: 'சுயவிவர உறுதிப்படுத்தல் தேவை',
    notEligible: 'தகுதி வரம்புகள் பொருந்தவில்லை',
    reasonsHeader: 'பொருந்திய அளவுகோல்கள்:',
    missingHeader: 'உறுதிப்படுத்த வேண்டியவை:',
    officialApplyHint: 'நீங்கள் முக்கிய தகுதிகளைப் பெறுகிறீர்கள்! அதிகாரப்பூர்வ இணையதளத்தில் விண்ணப்பிக்கவும்:',
    updateProfileHint: 'சுயவிவர விவரங்களைப் புதுப்பிக்கவும்:',
    updateProfileBtn: 'சுயவிவரத்திற்குச் செல்லவும்',
    close: 'மூடு',
  },
};

function getT(lang: string, key: string): string {
  const normalized = lang.toLowerCase();
  return (QUIZ_TRANSLATIONS[normalized] || QUIZ_TRANSLATIONS.en)[key] || QUIZ_TRANSLATIONS.en[key] || key;
}

export const SchemeEligibilityQuiz: React.FC<SchemeEligibilityQuizProps> = ({
  scheme,
  profile,
  language = 'en',
  onClose,
  onUpdateProfile,
}) => {
  const criteria = scheme.eligibility_criteria || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);

  // Dynamically generate questions based on scheme criteria
  const questions: Question[] = [];

  // 1. Role Question
  if (Array.isArray(criteria.roles) && criteria.roles.length > 0) {
    questions.push({
      id: 'role',
      textKey: 'role',
      questionText: {
        en: `Are you currently registered or working as a ${criteria.roles.join(' or ')}?`,
        hi: `क्या आप वर्तमान में ${criteria.roles.join(' या ')} के रूप में पंजीकृत हैं?`,
        ml: `നിങ്ങൾ ഇപ്പോൾ ${criteria.roles.join(' അല്ലെങ്കിൽ ')} ആയി പ്രവർത്തിക്കുന്നുണ്ടോ?`,
        ta: `நீங்கள் தற்போது ${criteria.roles.join(' அல்லது ')} ஆகப் பதிவுசெய்துள்ளீர்களா?`,
      },
      options: [
        { label: { en: 'Yes', hi: 'हाँ', ml: 'അതെ', ta: 'ஆம்' }, value: true },
        { label: { en: 'No', hi: 'नहीं', ml: 'ഇല്ല', ta: 'இல்லை' }, value: false },
      ],
    });
  }

  // 2. Landholding Question
  if (criteria.max_land_hectares !== undefined && criteria.max_land_hectares !== null) {
    questions.push({
      id: 'land',
      textKey: 'land',
      questionText: {
        en: `Do you own or cultivate land less than ${criteria.max_land_hectares} hectares (approx ${Math.round(criteria.max_land_hectares * 2.47)} acres)?`,
        hi: `क्या आपके पास ${criteria.max_land_hectares} हेक्टेयर से कम जमीन है?`,
        ml: `നിങ്ങൾക്ക് ${criteria.max_land_hectares} ഹെക്ടറിൽ കുറവ് കൃഷിഭൂമിയുണ്ടോ?`,
        ta: `உங்களிடம் ${criteria.max_land_hectares} ஹெக்டேருக்கும் குறைவான நிலம் உள்ளதா?`,
      },
      options: [
        { label: { en: 'Yes', hi: 'हाँ', ml: 'അതെ', ta: 'ஆம்' }, value: true },
        { label: { en: 'No', hi: 'नहीं', ml: 'ഇല്ല', ta: 'இல்லை' }, value: false },
        { label: { en: 'Not Sure', hi: 'पक्का नहीं', ml: 'ഉറപ്പില്ല', ta: 'நிச்சயமில்லை' }, value: 'unsure' },
      ],
    });
  }

  // 3. Crop Requirement Question
  if (Array.isArray(criteria.crops) && criteria.crops.length > 0) {
    const cropsList = criteria.crops.join(', ');
    questions.push({
      id: 'crops',
      textKey: 'crops',
      questionText: {
        en: `Do you cultivate food crops, oilseeds, or commercial crops matching (${cropsList})?`,
        hi: `क्या आप (${cropsList}) से संबंधित फसलों की खेती करते हैं?`,
        ml: `നിങ്ങൾ (${cropsList}) എന്നീ വിളകൾ കൃഷി ചെയ്യുന്നുണ്ടോ?`,
        ta: `நீங்கள் (${cropsList}) பயிர்களைப் பயிரிடுகிறீர்களா?`,
      },
      options: [
        { label: { en: 'Yes', hi: 'हाँ', ml: 'അതെ', ta: 'ஆம்' }, value: true },
        { label: { en: 'No', hi: 'नहीं', ml: 'ഇല്ല', ta: 'இல்லை' }, value: false },
      ],
    });
  }

  // 4. State Requirement Question
  if (typeof criteria.state === 'string' && criteria.state.trim()) {
    questions.push({
      id: 'state',
      textKey: 'state',
      questionText: {
        en: `Are you a resident or farmer based in ${criteria.state}?`,
        hi: `क्या आप ${criteria.state} के निवासी या किसान हैं?`,
        ml: `നിങ്ങൾ ${criteria.state} ലെ കർഷകനോ താമസക്കാരനോ ആണോ?`,
        ta: `நீங்கள் ${criteria.state} மாநிலத்தைச் சேர்ந்தவரா?`,
      },
      options: [
        { label: { en: 'Yes', hi: 'हाँ', ml: 'അതെ', ta: 'ஆம்' }, value: true },
        { label: { en: 'No', hi: 'नहीं', ml: 'ഇല്ല', ta: 'இல்லை' }, value: false },
      ],
    });
  }

  // 5. Exclusions Check
  if (Array.isArray(criteria.exclusions) && criteria.exclusions.length > 0) {
    questions.push({
      id: 'exclusions',
      textKey: 'exclusions',
      questionText: {
        en: `Do any exclusions apply to you (e.g. paying high income tax or holding institutional land)?`,
        hi: `क्या आप पर कोई छूट/बहिष्कार लागू होता है (जैसे आयकर दाता होना)?`,
        ml: `നിങ്ങൾ ആദായ നികുതി നൽകുന്നയാളോ സ്ഥാപന ഉടമയോ ആണോ?`,
        ta: `நீங்கள் வருமான வரி செலுத்துபவரா அல்லது நிறுவனம் சார்ந்தவரா?`,
      },
      options: [
        { label: { en: 'No (I am eligible)', hi: 'नहीं (मैं पात्र हूँ)', ml: 'ഇല്ല (ഞാൻ അർഹനാണ്)', ta: 'இல்லை' }, value: false },
        { label: { en: 'Yes (Excluded)', hi: 'हाँ (अपात्र)', ml: 'അതെ (ഒഴിവാക്കപ്പെട്ടത്)', ta: 'ஆம்' }, value: true },
      ],
    });
  }

  // Fallback question if scheme has generic criteria
  if (questions.length === 0) {
    questions.push({
      id: 'general',
      textKey: 'general',
      questionText: {
        en: `Do you have an active agricultural registration or bank account for direct benefit transfer?`,
        hi: `क्या आपके पास कृषि पंजीकरण या बैंक खाता है?`,
        ml: `നിങ്ങൾക്ക് കർഷക രജിസ്ട്രേഷനോ ബാങ്ക് അക്കൗണ്ടോ ഉണ്ടോ?`,
        ta: `உங்களிடம் விவசாயப் பதிவு அல்லது வங்கி கணக்கு உள்ளதா?`,
      },
      options: [
        { label: { en: 'Yes', hi: 'हाँ', ml: 'അതെ', ta: 'ஆம்' }, value: true },
        { label: { en: 'No', hi: 'नहीं', ml: 'ഇല്ല', ta: 'ഇல்லை' }, value: false },
      ],
    });
  }

  const currentQ = questions[currentStep];
  const langKey = language.toLowerCase();
  const currentQuestionText = currentQ.questionText[langKey] || currentQ.questionText.en;

  const handleOptionSelect = (value: any) => {
    const updated = { ...answers, [currentQ.id]: value };
    setAnswers(updated);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  // Process voice input for quiz answers
  const handleVoiceAnswer = (candidateFields: Record<string, any>) => {
    const speechText = String(candidateFields.query || candidateFields.search_query || candidateFields.notes || '').toLowerCase();
    
    if (speechText.includes('yes') || speechText.includes('അതെ') || speechText.includes('हाँ') || speechText.includes('ஆம்')) {
      handleOptionSelect(true);
    } else if (speechText.includes('no') || speechText.includes('ഇല്ല') || speechText.includes('नहीं') || speechText.includes('இல்லை')) {
      handleOptionSelect(false);
    }
  };

  // Evaluate final matching status based on both DB profile and quiz answers
  const matchResult = matchSchemeForProfile(scheme, profile);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        padding: '24px',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {getT(language, 'title')}
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>
              {scheme.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        {!showResult ? (
          /* Step-by-Step Question Flow */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                {getT(language, 'questionLabel')} {currentStep + 1} / {questions.length}
              </span>
              <SpeakButton text={currentQuestionText} language={language} label={getT(language, 'readAloud')} />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                {currentQuestionText}
              </p>
            </div>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt.value)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  <span>{opt.label[langKey] || opt.label.en}</span>
                  <span style={{ color: '#94a3b8' }}>➔</span>
                </button>
              ))}
            </div>

            {/* Voice Input Integration */}
            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 500 }}>
                🎙️ {getT(language, 'voiceAnswerHint')}
              </span>
              <VoiceInputButton
                context="scheme_search"
                appLanguage={language}
                onPopulate={handleVoiceAnswer}
                label="Speak Answer"
              />
            </div>

            {/* Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              {currentStep > 0 ? (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
                >
                  {getT(language, 'previous')}
                </button>
              ) : <div />}
              
              <button
                onClick={() => setShowResult(true)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
              >
                {getT(language, 'checkEligibility')}
              </button>
            </div>
          </div>
        ) : (
          /* Results Evaluation View */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex',
                padding: '8px 16px',
                borderRadius: '20px',
                background: matchResult.status === 'possible_match' ? '#dcfce7' : '#fef3c7',
                color: matchResult.status === 'possible_match' ? '#166534' : '#92400e',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '8px',
              }}>
                {matchResult.status === 'possible_match' ? getT(language, 'eligible') : getT(language, 'partiallyEligible')}
              </div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                {getT(language, 'resultTitle')}
              </h4>
            </div>

            {/* Verified Matched Reasons */}
            {matchResult.reasons.length > 0 && (
              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>
                  {getT(language, 'reasonsHeader')}
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#334155' }}>
                  {matchResult.reasons.map((r, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Confirmation Items */}
            {matchResult.missingInformation.length > 0 && (
              <div style={{ marginBottom: '16px', background: '#fffbeb', padding: '12px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', fontWeight: 700, color: '#b45309' }}>
                  {getT(language, 'missingHeader')}
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#78350f' }}>
                  {matchResult.missingInformation.map((m, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Apply Button Integration */}
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '8px' }}>
                {getT(language, 'officialApplyHint')}
              </p>
              <OfficialApplyButton
                officialApplyUrl={scheme.official_apply_url}
                officialLink={scheme.official_link}
                sourceUrl={scheme.source_url}
                applicationMethod={scheme.application_method}
              />
            </div>

            {/* Action Footer */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              {onUpdateProfile && (
                <button
                  onClick={onUpdateProfile}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #16a34a', background: '#f0fdf4', color: '#166534', fontWeight: 600, cursor: 'pointer' }}
                >
                  {getT(language, 'updateProfileBtn')}
                </button>
              )}
              <button
                onClick={onClose}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
              >
                {getT(language, 'close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
