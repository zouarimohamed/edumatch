import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, ArrowUpRight, LayoutGrid, Phone,
  MapPin, Mail, Send, Globe,
  Play, Sparkles, CheckCircle2, Star,
  MessageCircle, Bot, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentModal from './StudentModal';
import TeacherModal from './TeacherModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
};

/* ═══════════ MASCOTTES SVG ═══════════ */
const HeroMascot = () => (
  <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[420px]">
    <ellipse cx="200" cy="482" rx="100" ry="14" fill="#00153D" opacity="0.10"/>
    <rect x="120" y="260" width="160" height="180" rx="30" fill="#1E3A8A"/>
    <rect x="155" y="260" width="90" height="180" fill="#2D4FA3"/>
    <polygon points="200,272 211,302 200,372 189,302" fill="#F27438"/>
    <path d="M168 267 Q200 290 232 267" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
    <rect x="184" y="225" width="32" height="40" rx="9" fill="#FBBF7A"/>
    <ellipse cx="200" cy="198" rx="66" ry="70" fill="#FBBF7A"/>
    <path d="M138 183 Q143 122 200 118 Q257 122 262 183 Q256 157 200 152 Q144 157 138 183Z" fill="#1C1010"/>
    <path d="M138 183 Q132 167 135 152 Q140 138 147 144 Q142 158 143 173Z" fill="#1C1010"/>
    <path d="M262 183 Q268 167 265 152 Q260 138 253 144 Q258 158 257 173Z" fill="#1C1010"/>
    <ellipse cx="135" cy="203" rx="11" ry="14" fill="#FBBF7A"/>
    <ellipse cx="265" cy="203" rx="11" ry="14" fill="#FBBF7A"/>
    <ellipse cx="177" cy="196" rx="11" ry="12" fill="white"/>
    <ellipse cx="223" cy="196" rx="11" ry="12" fill="white"/>
    <circle cx="179" cy="198" r="7" fill="#1C1C1C"/>
    <circle cx="225" cy="198" r="7" fill="#1C1C1C"/>
    <circle cx="181" cy="195" r="2.5" fill="white"/>
    <circle cx="227" cy="195" r="2.5" fill="white"/>
    <path d="M166 185 Q177 180 188 185" stroke="#1C1010" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M212 185 Q223 180 234 185" stroke="#1C1010" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <ellipse cx="200" cy="212" rx="5" ry="3.5" fill="#E8A060" opacity="0.7"/>
    <path d="M183 226 Q200 241 217 226" stroke="#B85530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <rect x="153" y="137" width="94" height="14" rx="4" fill="#00153D"/>
    <polygon points="200,108 252,143 148,143" fill="#00153D"/>
    <rect x="248" y="141" width="5" height="28" fill="#F59E0B"/>
    <circle cx="250" cy="172" r="7" fill="#F59E0B"/>
    <rect x="68" y="278" width="56" height="28" rx="14" fill="#1E3A8A"/>
    <rect x="62" y="305" width="68" height="102" rx="12" fill="#F27438"/>
    <rect x="65" y="308" width="62" height="96" rx="10" fill="#FED7AA"/>
    <line x1="96" y1="312" x2="96" y2="402" stroke="#F27438" strokeWidth="2"/>
    <rect x="276" y="278" width="56" height="28" rx="14" fill="#1E3A8A"/>
    <rect x="293" y="305" width="28" height="130" rx="10" fill="#FBBF7A"/>
    <rect x="146" y="432" width="46" height="52" rx="12" fill="#1C3A6E"/>
    <rect x="208" y="432" width="46" height="52" rx="12" fill="#1C3A6E"/>
    <ellipse cx="169" cy="481" rx="30" ry="11" fill="#111827"/>
    <ellipse cx="231" cy="481" rx="30" ry="11" fill="#111827"/>
    <text x="315" y="175" fontSize="24" fill="#F27438" opacity="0.8">★</text>
    <text x="48" y="228" fontSize="16" fill="#3B82F6" opacity="0.55">✦</text>
    <text x="330" y="248" fontSize="12" fill="#F27438" opacity="0.45">✦</text>
  </svg>
);

const AboutMascot1 = () => (
  <svg viewBox="0 0 320 430" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-xl">
    <ellipse cx="160" cy="420" rx="82" ry="10" fill="#00153D" opacity="0.09"/>
    <path d="M78 225 Q88 405 160 415 Q232 405 242 225 Q212 248 160 252 Q108 248 78 225Z" fill="#00153D"/>
    <path d="M128 225 Q160 268 192 225 L192 415 Q160 424 128 415Z" fill="#1E40AF"/>
    <rect x="147" y="190" width="26" height="38" rx="8" fill="#F5C28A"/>
    <ellipse cx="160" cy="160" rx="57" ry="62" fill="#F5C28A"/>
    <path d="M106 153 Q110 101 160 96 Q210 101 214 153 Q207 126 160 121 Q113 126 106 153Z" fill="#2C1810"/>
    <ellipse cx="104" cy="162" rx="9" ry="13" fill="#F5C28A"/>
    <ellipse cx="216" cy="162" rx="9" ry="13" fill="#F5C28A"/>
    <ellipse cx="142" cy="157" rx="9" ry="10" fill="white"/>
    <ellipse cx="178" cy="157" rx="9" ry="10" fill="white"/>
    <circle cx="144" cy="159" r="6" fill="#1C1C1C"/>
    <circle cx="180" cy="159" r="6" fill="#1C1C1C"/>
    <circle cx="146" cy="157" r="2" fill="white"/>
    <circle cx="182" cy="157" r="2" fill="white"/>
    <path d="M133 146 Q142 141 151 146" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M169 146 Q178 141 187 146" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="160" cy="170" rx="4.5" ry="3" fill="#E0965A" opacity="0.65"/>
    <path d="M147 183 Q160 196 173 183" stroke="#C0603A" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <rect x="118" y="106" width="84" height="13" rx="4" fill="#00153D"/>
    <polygon points="160,78 208,112 112,112" fill="#00153D"/>
    <rect x="205" y="111" width="4" height="24" fill="#F59E0B"/>
    <circle cx="207" cy="137" r="6" fill="#F59E0B"/>
    <rect x="80" y="268" width="80" height="58" rx="7" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
    <rect x="84" y="272" width="72" height="50" rx="5" fill="#FFFBEB"/>
    <line x1="92" y1="284" x2="148" y2="284" stroke="#9CA3AF" strokeWidth="1.5"/>
    <line x1="92" y1="292" x2="148" y2="292" stroke="#9CA3AF" strokeWidth="1.5"/>
    <line x1="92" y1="300" x2="132" y2="300" stroke="#9CA3AF" strokeWidth="1.5"/>
    <circle cx="120" cy="313" r="6" fill="#F59E0B" opacity="0.85"/>
    <path d="M78 248 Q62 278 78 308 Q90 302 94 278Z" fill="#00153D"/>
    <path d="M242 248 Q258 278 242 308 Q230 302 226 278Z" fill="#00153D"/>
    <rect x="122" y="378" width="34" height="42" rx="9" fill="#0F2A5A"/>
    <rect x="164" y="378" width="34" height="42" rx="9" fill="#0F2A5A"/>
    <ellipse cx="139" cy="418" rx="24" ry="10" fill="#111827"/>
    <ellipse cx="181" cy="418" rx="24" ry="10" fill="#111827"/>
  </svg>
);

const AboutMascot2 = () => (
  <svg viewBox="0 0 360 390" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
    <rect x="8" y="15" width="230" height="148" rx="10" fill="#1E3A8A"/>
    <rect x="16" y="23" width="214" height="132" rx="7" fill="#1E40AF"/>
    <text x="32" y="60" fontSize="14" fill="white" fontFamily="monospace" fontWeight="bold">y = ax + b</text>
    <line x1="32" y1="78" x2="200" y2="78" stroke="#93C5FD" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="78" cy="105" r="20" fill="none" stroke="#FCD34D" strokeWidth="2.5"/>
    <line x1="58" y1="93" x2="98" y2="117" stroke="#FCD34D" strokeWidth="2"/>
    <text x="112" y="108" fontSize="12" fill="#6EE7B7" fontFamily="sans-serif">✓ Résolu !</text>
    <text x="32" y="145" fontSize="10" fill="#BFDBFE" fontFamily="sans-serif" opacity="0.8">Questions ? Levez la main !</text>
    <rect x="230" y="155" width="38" height="9" rx="4" fill="white" opacity="0.85"/>
    <line x1="58" y1="163" x2="48" y2="228" stroke="#6B7280" strokeWidth="3"/>
    <line x1="172" y1="163" x2="182" y2="228" stroke="#6B7280" strokeWidth="3"/>
    <line x1="52" y1="228" x2="178" y2="228" stroke="#6B7280" strokeWidth="2"/>
    <rect x="238" y="198" width="96" height="145" rx="22" fill="#065F46"/>
    <rect x="264" y="198" width="46" height="145" fill="#047857"/>
    <rect x="280" y="204" width="12" height="75" rx="4" fill="#B45309"/>
    <polygon points="280,278 286,296 292,278" fill="#92400E"/>
    <rect x="274" y="164" width="24" height="38" rx="8" fill="#FBBF7A"/>
    <ellipse cx="286" cy="134" rx="50" ry="54" fill="#FBBF7A"/>
    <path d="M238 120 Q242 78 286 74 Q330 78 334 120 Q326 96 286 92 Q246 96 238 120Z" fill="#4B3525"/>
    <circle cx="270" cy="130" r="14" fill="none" stroke="#1C1C1C" strokeWidth="2.5"/>
    <circle cx="302" cy="130" r="14" fill="none" stroke="#1C1C1C" strokeWidth="2.5"/>
    <line x1="284" y1="130" x2="288" y2="130" stroke="#1C1C1C" strokeWidth="2.5"/>
    <circle cx="270" cy="130" r="7" fill="#1C1C1C"/>
    <circle cx="302" cy="130" r="7" fill="#1C1C1C"/>
    <circle cx="272" cy="128" r="2.5" fill="white"/>
    <circle cx="304" cy="128" r="2.5" fill="white"/>
    <path d="M274 150 Q286 158 298 150" stroke="#4B3525" strokeWidth="2.5" fill="#6B4C30"/>
    <ellipse cx="237" cy="138" rx="9" ry="12" fill="#FBBF7A"/>
    <ellipse cx="335" cy="138" rx="9" ry="12" fill="#FBBF7A"/>
    <path d="M238 228 Q208 248 172 228 Q176 212 200 216 Q220 218 236 226Z" fill="#065F46"/>
    <ellipse cx="166" cy="228" rx="14" ry="11" fill="#FBBF7A"/>
    <path d="M334 228 Q348 256 336 288" stroke="#065F46" strokeWidth="22" strokeLinecap="round" fill="none"/>
    <rect x="250" y="335" width="36" height="50" rx="9" fill="#064E3B"/>
    <rect x="294" y="335" width="36" height="50" rx="9" fill="#064E3B"/>
    <ellipse cx="268" cy="382" rx="26" ry="10" fill="#111827"/>
    <ellipse cx="312" cy="382" rx="26" ry="10" fill="#111827"/>
  </svg>
);

const WhyMascot = () => (
  <svg viewBox="0 0 420 460" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[400px]">
    <ellipse cx="210" cy="430" rx="130" ry="20" fill="#38BDF8" opacity="0.15"/>
    <ellipse cx="210" cy="240" rx="180" ry="180" fill="#E0F2FE" opacity="0.35"/>
    <circle cx="80" cy="100" r="8" fill="#38BDF8" opacity="0.6"/>
    <circle cx="340" cy="130" r="6" fill="#38BDF8" opacity="0.5"/>
    <path d="M130 320 Q90 290 95 240 Q100 170 160 145 Q200 132 240 145 Q300 170 310 240 Q318 292 278 322 Q240 348 210 350 Q175 350 130 320Z" fill="url(#blobGrad)" opacity="0.95"/>
    <defs>
      <radialGradient id="blobGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="50%" stopColor="#38BDF8"/>
        <stop offset="100%" stopColor="#0284C7"/>
      </radialGradient>
    </defs>
    <rect x="153" y="200" width="42" height="30" rx="12" fill="none" stroke="#1C1C1C" strokeWidth="3"/>
    <rect x="203" y="200" width="42" height="30" rx="12" fill="none" stroke="#1C1C1C" strokeWidth="3"/>
    <line x1="195" y1="215" x2="203" y2="215" stroke="#1C1C1C" strokeWidth="2.5"/>
    <rect x="155" y="202" width="38" height="26" rx="10" fill="#BAE6FD" opacity="0.4"/>
    <rect x="205" y="202" width="38" height="26" rx="10" fill="#BAE6FD" opacity="0.4"/>
    <circle cx="174" cy="215" r="8" fill="#1E3A8A" opacity="0.85"/>
    <circle cx="224" cy="215" r="8" fill="#1E3A8A" opacity="0.85"/>
    <circle cx="177" cy="212" r="3" fill="white" opacity="0.8"/>
    <circle cx="227" cy="212" r="3" fill="white" opacity="0.8"/>
    <path d="M187 255 Q210 272 233 255" stroke="#0C4A6E" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <ellipse cx="108" cy="270" rx="22" ry="14" fill="#38BDF8" transform="rotate(-30 108 270)"/>
    <ellipse cx="315" cy="265" rx="22" ry="14" fill="#38BDF8" transform="rotate(30 315 265)"/>
    <ellipse cx="185" cy="368" rx="24" ry="30" fill="#0284C7"/>
    <ellipse cx="235" cy="368" rx="24" ry="30" fill="#0284C7"/>
    <ellipse cx="182" cy="398" rx="28" ry="16" fill="#0EA5E9"/>
    <ellipse cx="238" cy="398" rx="28" ry="16" fill="#0EA5E9"/>
    <rect x="165" y="128" width="90" height="12" rx="4" fill="#00153D"/>
    <polygon points="210,102 256,132 164,132" fill="#00153D"/>
    <rect x="252" y="130" width="4" height="20" fill="#F59E0B"/>
    <circle cx="254" cy="153" r="6" fill="#F59E0B"/>
  </svg>
);

const IconStudent = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="50" cy="30" r="20" fill="#FBBF7A"/>
    <path d="M20 95 Q30 65 50 60 Q70 65 80 95Z" fill="#1E3A8A"/>
    <polygon points="50,5 76,23 24,23" fill="#00153D"/>
    <rect x="21" y="20" width="58" height="7" rx="3" fill="#00153D"/>
    <rect x="74" y="23" width="4" height="16" fill="#F59E0B"/>
    <circle cx="76" cy="41" r="4.5" fill="#F59E0B"/>
    <circle cx="42" cy="29" r="4.5" fill="white"/>
    <circle cx="58" cy="29" r="4.5" fill="white"/>
    <circle cx="43.5" cy="30" r="3" fill="#1C1C1C"/>
    <circle cx="59.5" cy="30" r="3" fill="#1C1C1C"/>
    <path d="M43 41 Q50 47 57 41" stroke="#C0603A" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const IconTeacher = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="50" cy="27" r="18" fill="#FBBF7A"/>
    <path d="M22 94 Q30 62 50 57 Q70 62 78 94Z" fill="#065F46"/>
    <rect x="10" y="53" width="38" height="27" rx="5" fill="#1E40AF"/>
    <rect x="13" y="56" width="32" height="21" rx="3" fill="#DBEAFE"/>
    <line x1="18" y1="63" x2="40" y2="63" stroke="#1E3A8A" strokeWidth="1.5"/>
    <line x1="18" y1="69" x2="37" y2="69" stroke="#1E3A8A" strokeWidth="1.5"/>
    <line x1="18" y1="75" x2="34" y2="75" stroke="#1E3A8A" strokeWidth="1.5"/>
    <circle cx="42" cy="26" r="7" fill="none" stroke="#1C1C1C" strokeWidth="2"/>
    <circle cx="58" cy="26" r="7" fill="none" stroke="#1C1C1C" strokeWidth="2"/>
    <line x1="49" y1="26" x2="51" y2="26" stroke="#1C1C1C" strokeWidth="1.5"/>
    <circle cx="43" cy="27" r="3" fill="#1C1C1C"/>
    <circle cx="59" cy="27" r="3" fill="#1C1C1C"/>
    <path d="M43 36 Q50 43 57 36" stroke="#C0603A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M32 13 Q50 7 68 13 Q64 21 50 18 Q38 21 32 13Z" fill="#2C1810"/>
  </svg>
);

/* ═══════════ MASCOTTE EDUBOT (robot original) ═══════════ */
const EduBotMascot = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="100" cy="100" r="90" fill="#EEF2FF"/>
    <circle cx="100" cy="100" r="70" fill="#E0E7FF" opacity="0.5"/>
    {/* Corps robot */}
    <rect x="60" y="50" width="80" height="70" rx="20" fill="url(#botGrad)"/>
    <defs>
      <radialGradient id="botGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#818CF8"/>
        <stop offset="50%" stopColor="#6366F1"/>
        <stop offset="100%" stopColor="#4338CA"/>
      </radialGradient>
    </defs>
    {/* Antennes */}
    <line x1="80" y1="50" x2="75" y2="30" stroke="#312E81" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="75" cy="28" r="4" fill="#FCD34D"/>
    <line x1="120" y1="50" x2="125" y2="30" stroke="#312E81" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="125" cy="28" r="4" fill="#FCD34D"/>
    {/* Écran visage */}
    <rect x="70" y="65" width="60" height="40" rx="10" fill="#1E1B4B"/>
    {/* Yeux LED verts animés */}
    <circle cx="90" cy="85" r="8" fill="#4ADE80" opacity="0.9"/>
    <circle cx="110" cy="85" r="8" fill="#4ADE80" opacity="0.9"/>
    {/* Reflets yeux */}
    <circle cx="87" cy="82" r="2.5" fill="white" opacity="0.6"/>
    <circle cx="107" cy="82" r="2.5" fill="white" opacity="0.6"/>
    {/* Bouche LED */}
    <rect x="85" y="100" width="30" height="4" rx="2" fill="#4ADE80" opacity="0.7"/>
    {/* Corps bas */}
    <rect x="70" y="120" width="60" height="50" rx="15" fill="#4338CA"/>
    {/* Icône diplôme sur le corps */}
    <text x="100" y="150" fontSize="20" textAnchor="middle" fill="white">🎓</text>
    {/* Bras */}
    <rect x="45" y="130" width="22" height="8" rx="4" fill="#6366F1"/>
    <rect x="133" y="130" width="22" height="8" rx="4" fill="#6366F1"/>
    {/* Roues */}
    <circle cx="85" cy="182" r="12" fill="#1E1B4B"/>
    <circle cx="115" cy="182" r="12" fill="#1E1B4B"/>
    <circle cx="85" cy="182" r="5" fill="#6366F1"/>
    <circle cx="115" cy="182" r="5" fill="#6366F1"/>
  </svg>
);

/* ═══════════ ILLUSTRATION CHATBOT CLAIRE ET ANIMÉE ═══════════ */
const ChatbotIllustration = () => {
  const [step, setStep] = useState(0);
  const conversation = [
    { role: 'user', text: 'Je cherche un prof de maths pour le bac à Sfax, budget 30 DT.' },
    { role: 'bot',  text: 'Analyse en cours... Extraction des critères...' },
    { role: 'info', text: '📊  Matière : Maths  ·  Niveau : Bac  ·  Ville : Sfax  ·  Budget : 30 DT' },
    { role: 'bot',  text: '🎯 3 formateurs trouvés ! Score max : 94/100' },
  ];

  useEffect(() => {
    if (step < conversation.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 1000 : 1700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setStep(0), 3000);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="w-full max-w-[400px]">
      {/* Carte principale */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 overflow-hidden border border-indigo-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1a6e] to-[#2d2db0] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar EduBot illustré */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <circle cx="20" cy="20" r="20" fill="url(#avatarGrad)"/>
                <defs>
                  <radialGradient id="avatarGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#818CF8"/>
                    <stop offset="100%" stopColor="#4F46E5"/>
                  </radialGradient>
                </defs>
                {/* Tête robot */}
                <rect x="10" y="12" width="20" height="16" rx="5" fill="white" opacity="0.92"/>
                {/* Yeux LED */}
                <motion.circle cx="16" cy="20" r="2.5" fill="#4F46E5"
                  animate={{ opacity:[1,0.3,1] }} transition={{ duration:2, repeat:Infinity, delay:0 }}/>
                <motion.circle cx="24" cy="20" r="2.5" fill="#4F46E5"
                  animate={{ opacity:[1,0.3,1] }} transition={{ duration:2, repeat:Infinity, delay:0.3 }}/>
                {/* Bouche */}
                <rect x="15" y="24" width="10" height="2" rx="1" fill="#4F46E5" opacity="0.6"/>
                {/* Antennes */}
                <line x1="16" y1="12" x2="14" y2="7" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <circle cx="14" cy="6" r="1.5" fill="#FCD34D"/>
                <line x1="24" y1="12" x2="26" y2="7" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <circle cx="26" cy="6" r="1.5" fill="#FCD34D"/>
              </svg>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"/>
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">EduBot</p>
              <div className="flex items-center gap-1 mt-0.5">
                <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.5, repeat:Infinity }}
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>
                <p className="text-indigo-200 text-[10px] font-medium">LLaMA 3.1 · Groq API</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {['#ef4444','#f59e0b','#10b981'].map((c,i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:c}}/>
            ))}
          </div>
        </div>

        {/* Corps messages */}
        <div className="bg-gray-50 px-4 py-4 min-h-[200px] space-y-3">
          {conversation.slice(0, step + 1).map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:6, scale:0.96 }}
              animate={{ opacity:1, y:0, scale:1 }}
              transition={{ duration:0.28 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'info' ? (
                <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-indigo-700 text-[11px] font-semibold">{msg.text}</p>
                </div>
              ) : (
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#1a1a6e] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-md'
                }`}>
                  {msg.role === 'bot' && i === step && step === 1 ? (
                    <span className="flex items-center gap-1.5">
                      {msg.text}
                      <span className="flex gap-0.5 ml-1">
                        {[0,1,2].map(d => (
                          <motion.span key={d}
                            animate={{ y:[0,-3,0] }} transition={{ duration:0.5, repeat:Infinity, delay:d*0.15 }}
                            className="w-1 h-1 bg-indigo-400 rounded-full inline-block"/>
                        ))}
                      </span>
                    </span>
                  ) : msg.text}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Input simulé */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <p className="text-gray-400 text-xs font-medium">Décrivez votre besoin en langage naturel...</p>
          </div>
          <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:1.8, repeat:Infinity }}
            className="w-8 h-8 bg-gradient-to-br from-[#1a1a6e] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-md cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Badges flottants sous le chat */}
      <div className="flex justify-center gap-4 mt-5">
        {[
          { label: '< 200ms', sub: 'Latence' },
          { label: '94/100',  sub: 'Score max' },
          { label: '6',       sub: 'Critères' },
        ].map(b => (
          <div key={b.label} className="text-center bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <p className="font-black text-[#1a1a6e] text-base leading-none">{b.label}</p>
            <p className="text-gray-400 text-[10px] mt-0.5 font-medium">{b.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════ COMPOSANT PRINCIPAL ═══════════ */
const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const centers = [
    { city: 'Tunis',    addr: 'Centre Urbain Nord, Immeuble Horizon', color: 'from-blue-600 to-indigo-500',  map: 'https://maps.google.com/?q=Tunis+Tunisie'    },
    { city: 'Sfax',     addr: 'Route de Gremda, Km 0.5',              color: 'from-orange-500 to-red-500',   map: 'https://maps.google.com/?q=Sfax+Tunisie'     },
    { city: 'Sousse',   addr: 'Boulevard du 14 Janvier',              color: 'from-purple-600 to-pink-500',  map: 'https://maps.google.com/?q=Sousse+Tunisie'   },
    { city: 'Monastir', addr: "Avenue de la République",              color: 'from-emerald-500 to-teal-500', map: 'https://maps.google.com/?q=Monastir+Tunisie' },
  ];

  const expertises = [
    'Mathématiques','Physique-Chimie','Sciences de la Vie','Arabe & Français',
    'Informatique','Programmation','Développement Web','IA & Big Data',
    'UI/UX Design','Marketing Digital','Cybersécurité','Cloud Computing',
    'Finance & Gestion','Management','Langues Étrangères','Préparation Bac',
  ];

  const whyItems = [
    { title: 'Matching intelligent multicritères', desc: "Notre algorithme analyse 6 dimensions (matière, niveau, ville, budget, mode, réputation) pour proposer les 3 meilleurs formateurs avec un score sur 100 points." },
    { title: 'Chatbot IA EduBot',                 desc: "EduBot comprend vos besoins en langage naturel grâce à LLaMA 3.1 via Groq, extrait vos critères et vous guide vers la réservation en moins de 5 secondes." },
    { title: 'Formateurs certifiés et validés',   desc: "Tous nos professeurs passent par un workflow de validation : profil complet, documents vérifiés, approbation administrative par l'équipe EduMatch." },
    { title: 'Cours en ligne ou présentiel',      desc: "Séances en direct avec lien Google Meet généré automatiquement, ou cours en présentiel dans nos centres partenaires en Tunisie." },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFF] text-[#00153D] font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">

      <StudentModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)}/>
      <TeacherModal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)}/>

      {/* BLOBS fond */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] animate-pulse"/>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px]"/>
      </div>

      {/* ── NAVBAR — sans Formateurs/Étudiants/Enseignants ─────── */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'py-3 bg-white/70 backdrop-blur-2xl shadow-xl' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <span onClick={() => navigate('/')}
              className="text-3xl font-black tracking-tighter text-blue-600 cursor-pointer hover:scale-105 transition-transform select-none">
              EDUMATCH
            </span>
            {/* Liens de navigation publics uniquement */}
            <div className="hidden lg:flex gap-7 font-bold text-xs uppercase tracking-[0.18em] text-gray-500">
              {[
                { label: 'Accueil',    href: '#accueil'    },
                { label: 'Propos',     href: '#propos'     },
                { label: 'Pourquoi',   href: '#pourquoi'   },
                { label: 'Écosystème', href: '#ecosystème' },
                { label: 'Centres',    href: '#centres'    },
              ].map(l => (
                <a key={l.label} href={l.href} className="hover:text-blue-600 transition-colors relative group">
                  {l.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"/>
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <input type="text" placeholder="Rechercher une matière..." readOnly onClick={() => navigate('/login')}
                className="bg-gray-100/50 border border-transparent rounded-full py-2.5 px-6 w-60 outline-none transition-all font-medium text-sm cursor-pointer focus:bg-white focus:ring-4 focus:ring-blue-100"/>
              <button onClick={() => navigate('/login')}
                className="absolute right-2 top-1.5 bg-[#00153D] p-2 rounded-full text-white group-hover:bg-blue-600 transition-colors">
                <Search size={16}/>
              </button>
            </div>
            <button onClick={() => navigate('/login')}
              className="p-2.5 border-2 border-gray-100 rounded-full hover:bg-white hover:shadow-md text-gray-400 transition-all hover:text-blue-600 hover:border-blue-200">
              <User size={20}/>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section id="accueil" className="relative pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="lg:w-1/2 space-y-10 z-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 bg-white/80 border border-white px-5 py-2.5 rounded-full shadow-sm backdrop-blur-sm">
            <Sparkles className="text-orange-500 animate-bounce" size={18}/>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">EduMatch Tunisia • IA & Matching Intelligent</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-6xl md:text-[88px] font-black leading-[0.85] tracking-tighter">
            Trouvez votre <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F27438] to-[#E85D1C]">Formateur <br/> Idéal</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-500 text-xl max-w-xl font-medium leading-relaxed italic">
            Fini la recherche interminable. Notre <span className="text-blue-600 font-black">IA EduBot</span> analyse vos besoins et vous connecte aux meilleurs professeurs certifiés en Tunisie en temps réel.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
            {/* → /login */}
            <button onClick={() => navigate('/login')}
              className="group bg-[#00153D] text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-4 active:scale-95">
              Trouver Un Formateur <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
            </button>
            <button onClick={() => setIsStudentModalOpen(true)} className="flex items-center gap-4 px-8 border-l-2 border-gray-100 group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-orange-500 cursor-pointer hover:scale-110 transition-transform">
                <Play fill="currentColor" size={16}/>
              </div>
              <span className="font-bold text-gray-400 uppercase text-xs tracking-widest group-hover:text-blue-600 transition-colors">Comment ça marche</span>
            </button>
          </motion.div>
        </motion.div>
        <div className="lg:w-1/2 relative flex justify-center">
          <motion.div animate={{ y:[0,-22,0], rotate:[0,1.5,0] }} transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}
            className="w-full max-w-[460px] z-10">
            <HeroMascot/>
          </motion.div>
          <motion.div animate={{ scale:[1,1.05,1] }} transition={{ duration:4, repeat:Infinity }}
            className="absolute top-10 left-0 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl z-20 flex items-center gap-4 border border-white">
            <div className="flex -space-x-3">
              {[21,22,23,24].map(i => <img key={i} className="w-10 h-10 rounded-full border-4 border-white shadow-md" src={`https://i.pravatar.cc/100?img=${i}`} alt=""/>)}
            </div>
            <div>
              <p className="text-xl font-black text-[#00153D] leading-none">+2k</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Étudiants inscrits</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── À PROPOS ───────────────────────────────────────────── */}
      <section id="propos" className="py-32 px-6 md:px-20 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 relative min-h-[580px] w-full">
            <div className="absolute top-0 left-0 w-36 h-36 opacity-20 animate-pulse"
              style={{ backgroundImage:'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize:'16px 16px' }}/>
            <motion.div initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }}
              className="absolute top-10 left-0 z-10 w-[330px] md:w-[390px]">
              <AboutMascot1/>
            </motion.div>
            <div className="absolute top-16 right-20 bg-[#00153D] text-white p-7 rounded-[2rem] shadow-2xl z-20 text-center min-w-[160px] border border-white/10">
              <p className="text-5xl font-black italic">+2,000</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-60">Étudiants inscrits</p>
            </div>
            <div className="absolute top-36 right-0 bg-[#2D3E50] text-white p-7 rounded-[2rem] shadow-2xl z-20 text-center min-w-[150px] border border-white/10">
              <p className="text-5xl font-black italic">+100</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-60">Formateurs certifiés</p>
            </div>
            <motion.div initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[255px] md:w-[305px]">
              <AboutMascot2/>
            </motion.div>
            <motion.div whileHover={{ scale:1.05 }}
              className="absolute bottom-16 -left-4 bg-[#FFF9F6] border-2 border-orange-100/50 p-6 rounded-[2.5rem] shadow-2xl z-30 flex items-center gap-5 min-w-[320px] backdrop-blur-sm">
              <div className="bg-[#F27438] p-5 rounded-full text-white shadow-xl shadow-orange-200"><Bot size={30} strokeWidth={3}/></div>
              <div>
                <p className="font-black text-[#1A2B49] text-lg italic tracking-tight">EduBot IA</p>
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.1em]">Matching en &lt; 5 secondes</p>
              </div>
            </motion.div>
          </div>
          <div className="lg:w-1/2 space-y-10">
            <div className="flex items-center gap-3 text-[#00153D] font-black text-xs uppercase tracking-[0.4em]">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"/>
              À propos d'EduMatch
            </div>
            <h2 className="text-6xl md:text-7xl font-black leading-[1] tracking-tighter italic text-[#1A2B49]">
              L'endroit où vous pouvez réussir
            </h2>
            <p className="text-gray-500 text-xl leading-relaxed font-medium italic border-l-4 border-blue-50 pl-6">
              Bienvenue sur EduMatch, la plateforme intelligente de mise en relation apprenants-formateurs en Tunisie. Que vous prépariez le Bac, le Brevet ou que vous montiez en compétences professionnelles, nous trouvons le professeur parfait pour vous.
            </p>
            <div className="grid gap-12 pt-6">
              {[
                { icon:<Bot size={40}/>, title:'EduBot IA', desc:"Assistant conversationnel alimenté par LLaMA 3.1 qui comprend vos besoins en langage naturel et extrait automatiquement vos critères de recherche." },
                { icon:<Target size={40}/>, title:'Score de Compatibilité', desc:"Algorithme de scoring multicritères sur 100 points : matière (25 pts), niveau (40 pts), ville (15 pts), budget (10 pts), mode (5 pts), réputation (5 pts)." },
              ].map((item,i) => (
                <motion.div key={i} whileHover={{ x:10 }} className="flex items-start gap-8 group">
                  <div className="bg-blue-50 p-6 rounded-[2rem] text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">{item.icon}</div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-[#1A2B49] tracking-tight">{item.title}</h3>
                    <p className="text-gray-400 text-lg font-medium italic">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POURQUOI ─────────────────────────────────────────── */}
      <section id="pourquoi" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} transition={{ duration:0.7 }}
            className="lg:w-1/2 space-y-10">
            <div className="flex items-center gap-3 text-[#00153D] font-black text-xs uppercase tracking-[0.4em]">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"/>
              Découvrir EduMatch
            </div>
            <h2 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tighter text-[#00153D]">
              Pourquoi choisir <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">EduMatch ?</span>
            </h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              La plupart des plateformes vous laissent seul face à des annonces désorganisées.{' '}
              <span className="font-black text-[#00153D]">EduMatch remet l'intelligence au centre.</span>
            </p>
            <div className="space-y-7 pt-2">
              {whyItems.map((item,i) => (
                <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.12, duration:0.5 }} className="flex items-start gap-5 group">
                  <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                    <CheckCircle2 size={18} className="text-blue-600 group-hover:text-white transition-colors"/>
                  </div>
                  <div>
                    <span className="font-black text-[#00153D] text-base">{item.title} : </span>
                    <span className="text-gray-500 text-base leading-relaxed">{item.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <div className="lg:w-1/2 relative flex justify-center min-h-[500px]">
            <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
              className="absolute top-4 left-4 z-20 w-16 h-16 bg-[#F27438] rounded-full flex items-center justify-center shadow-2xl shadow-orange-200">
              <Bot size={28} className="text-white"/>
            </motion.div>
            <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut', delay:0.5 }}
              className="absolute top-0 right-0 z-20 bg-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3 border border-gray-50">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                <Star size={20} fill="white" className="text-white"/>
              </div>
              <div>
                <p className="font-black text-[#00153D] text-lg leading-none">4.6<span className="text-gray-400 font-bold text-sm ml-1">(2.4k)</span></p>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Avis Moyens</p>
              </div>
            </motion.div>
            <motion.div animate={{ y:[0,-18,0] }} transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}
              className="relative z-10 w-full max-w-[400px] mt-10">
              <WhyMascot/>
            </motion.div>
            <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut', delay:1 }}
              className="absolute bottom-10 right-0 z-20 bg-white rounded-2xl shadow-2xl px-5 py-4 border border-gray-50">
              <p className="font-black text-[#00153D] text-lg leading-none mb-2">
                2K+ <span className="text-gray-500 font-bold text-sm">Étudiants inscrits</span>
              </p>
              <div className="flex -space-x-3">
                {[30,31,32,33,34].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/60?img=${i}`} alt="" className="w-9 h-9 rounded-full border-2 border-white shadow"/>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXPERTISES 4×4 ───────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-[0.5em] mb-8">
          <LayoutGrid size={20}/> Nos Matières
        </div>
        <h2 className="text-6xl font-black mb-16 tracking-tighter">Toutes les matières, tous les niveaux</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {expertises.map((skill,i) => (
            <motion.div key={i} whileHover={{ y:-5, scale:1.02 }} onClick={() => navigate('/login')}
              className="bg-white border-2 border-gray-50 p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] font-black text-base hover:border-blue-100 hover:shadow-xl transition-all cursor-pointer">
              {skill}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ÉCOSYSTÈME ─────────────────────────────────────────── */}
      <section id="ecosystème" className="py-32 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black italic tracking-tighter">Un écosystème de réussite</h2>
            <p className="text-gray-400 text-xl mt-4 font-medium italic">Une plateforme, deux opportunités illimitées.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {[
              { title:'Apprenants', Icon:IconStudent, desc:"Trouvez le formateur idéal grâce à notre IA EduBot. Réservez des séances en ligne (Google Meet) ou en présentiel, suivez votre progression et réussissez vos examens.", action:() => setIsStudentModalOpen(true), btnText:"Comment ça marche" },
              { title:'Formateurs', Icon:IconTeacher, desc:"Partagez votre expertise, gérez votre calendrier et vos revenus depuis un tableau de bord intuitif. Développez votre clientèle en Tunisie grâce à notre algorithme de matching.", action:() => setIsTeacherModalOpen(true), btnText:"Devenir Formateur" },
            ].map((item,idx) => (
              <motion.div key={idx} whileHover={{ y:-15 }}
                className="bg-white p-12 rounded-[60px] shadow-2xl shadow-gray-100 border border-gray-50 text-center group transition-all">
                <div className="w-28 h-28 mx-auto mb-10 transform group-hover:rotate-12 group-hover:scale-110 transition-transform">
                  <item.Icon/>
                </div>
                <h3 className="text-4xl font-black mb-6 italic tracking-tight">{item.title}</h3>
                <p className="text-gray-400 mb-10 text-lg font-medium italic leading-relaxed">{item.desc}</p>
                <button onClick={item.action}
                  className="font-black text-blue-600 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 mx-auto group-hover:scale-110 transition-transform">
                  {item.btnText} <ArrowUpRight size={18}/>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUBOT CTA — fond dégradé professionnel indigo/violet ── */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #1e3a8a 60%, #0f172a 100%)' }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">

          {/* Texte gauche */}
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full">
              <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }}
                className="w-2 h-2 bg-emerald-400 rounded-full"/>
              <span className="text-sm font-bold uppercase tracking-wider text-white/90">EduBot IA — En ligne</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black leading-tight text-white">
              Discutez avec notre IA et trouvez votre formateur en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">5 secondes</span>
            </h2>
            <p className="text-indigo-200 text-xl leading-relaxed">
              Pas besoin de chercher manuellement. Dites simplement{' '}
              <span className="text-white font-semibold italic">"Je cherche un prof de maths pour le bac à Sfax"</span>{' '}
              et EduBot s'occupe du reste.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {['🎓 Primaire & Collège','📐 Lycée & Bac','💻 Université','💼 Professionnel'].map(tag => (
                <span key={tag} className="bg-white/10 border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {/* → /login */}
              <button onClick={() => navigate('/login')}
                className="bg-white text-[#1e1b4b] px-8 py-4 rounded-2xl font-black text-base shadow-2xl hover:shadow-indigo-400/30 hover:scale-105 transition-all flex items-center gap-3 group">
                <Bot size={22} className="text-indigo-600"/>
                Essayer EduBot
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-indigo-600"/>
              </button>
              <button onClick={() => navigate('/login')}
                className="border border-white/25 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/10 transition-all flex items-center gap-3">
                <MessageCircle size={20}/>
                Discuter avec EduBot
              </button>
            </div>
          </div>

          {/* Robot animé + fenêtre chat */}
          <div className="lg:w-1/2 flex flex-col items-center gap-4">

            {/* Halo lumineux + robot agrandi */}
            <div className="relative flex justify-center">
              {/* Cercles halo pulsants */}
              <motion.div
                animate={{ scale:[1,1.18,1], opacity:[0.18,0.06,0.18] }}
                transition={{ duration:2.8, repeat:Infinity }}
                className="absolute inset-0 m-auto w-52 h-52 rounded-full"
                style={{ background:'radial-gradient(circle, #818CF8 0%, transparent 70%)' }}/>
              <motion.div
                animate={{ scale:[1,1.32,1], opacity:[0.10,0.04,0.10] }}
                transition={{ duration:2.8, repeat:Infinity, delay:0.4 }}
                className="absolute inset-0 m-auto w-52 h-52 rounded-full"
                style={{ background:'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}/>

              {/* Robot agrandi avec lévitation */}
              <motion.div
                animate={{ y:[0,-14,0], rotate:[0,1,-1,0] }}
                transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut' }}
                className="relative w-52 h-52">
                <EduBotMascot/>

                {/* Yeux clignotants superposés */}
                <motion.div
                  animate={{ scaleY:[1,0.05,1] }}
                  transition={{ duration:3.5, repeat:Infinity, delay:1.5 }}
                  style={{ position:'absolute', top:'41%', left:'32%', width:20, height:20, borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 12px #4ADE80' }}/>
                <motion.div
                  animate={{ scaleY:[1,0.05,1] }}
                  transition={{ duration:3.5, repeat:Infinity, delay:1.7 }}
                  style={{ position:'absolute', top:'41%', left:'52%', width:20, height:20, borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 12px #4ADE80' }}/>

                {/* Bulle de parole */}
                <motion.div
                  animate={{ opacity:[0,1,1,0], scale:[0.8,1,1,0.8], y:[4,0,0,4] }}
                  transition={{ duration:3.5, repeat:Infinity, delay:0.5 }}
                  style={{ position:'absolute', top:'-36px', right:'-20px', background:'white', color:'#4338CA', fontSize:'11px', fontWeight:900, padding:'7px 14px', borderRadius:'18px', boxShadow:'0 4px 18px rgba(99,102,241,0.25)', border:'1.5px solid #e0e7ff', whiteSpace:'nowrap' }}>
                  Je suis prêt ! 🎯
                  <div style={{ position:'absolute', bottom:'-7px', left:'14px', width:'13px', height:'13px', background:'white', borderRight:'1.5px solid #e0e7ff', borderBottom:'1.5px solid #e0e7ff', transform:'rotate(45deg)' }}/>
                </motion.div>

                {/* Particules flottantes autour */}
                {[
                  { top:'-8px', left:'10px', delay:0,   size:8,  color:'#FCD34D' },
                  { top:'20px', right:'-12px', delay:0.6, size:6, color:'#818CF8' },
                  { bottom:'10px', left:'-10px', delay:1.1, size:7, color:'#4ADE80' },
                  { bottom:'-4px', right:'10px', delay:1.7, size:5, color:'#F472B6' },
                ].map((p, i) => (
                  <motion.div key={i}
                    animate={{ y:[0,-10,0], opacity:[0.5,1,0.5] }}
                    transition={{ duration:2+i*0.3, repeat:Infinity, delay:p.delay }}
                    style={{ position:'absolute', top:p.top, left:p.left, right:p.right, bottom:p.bottom, width:p.size, height:p.size, borderRadius:'50%', background:p.color, boxShadow:`0 0 6px ${p.color}` }}/>
                ))}
              </motion.div>
            </div>

            {/* Fenêtre chat */}
            <ChatbotIllustration/>
          </div>
        </div>
      </section>

      {/* ── CENTRES ────────────────────────────────────────────── */}
      <section id="centres" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-6xl font-black tracking-tighter mb-4 italic">Nos Centres en Tunisie</h2>
            <p className="text-gray-400 text-xl font-medium italic">Retrouvez nos hubs physiques pour des séances en présentiel dans toute la Tunisie.</p>
          </div>
          <div className="flex items-center gap-2 font-black text-blue-600 text-sm uppercase tracking-widest bg-blue-50 px-6 py-3 rounded-full italic">
            <Globe size={18}/> Présence Nationale
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {centers.map((center,i) => (
            <motion.div key={i} whileHover={{ y:-10 }} className="relative h-[450px] rounded-[70px] overflow-hidden shadow-2xl group">
              <div className={`absolute inset-0 bg-gradient-to-br ${center.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}/>
              <div className="absolute inset-0 p-12 flex flex-col justify-end text-white z-10">
                <MapPin size={45} className="mb-6 opacity-80"/>
                <h3 className="text-4xl font-black mb-2 tracking-tighter italic">{center.city}</h3>
                <p className="text-[11px] font-bold opacity-70 mb-10 leading-tight uppercase tracking-widest italic">{center.addr}</p>
                <a href={center.map} target="_blank" rel="noreferrer"
                  className="bg-white text-black py-5 rounded-[2rem] font-black text-center flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all shadow-xl">
                  Voir sur la carte <MapPin size={16}/>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#00153D] text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 space-y-6">
              <div>
                <span className="text-5xl font-black tracking-tighter text-white">EDUMATCH</span>
                <p className="text-[10px] font-black uppercase opacity-30 italic tracking-[0.5em] mt-1">Plateforme Intelligente TN</p>
              </div>
              <p className="text-blue-200 text-base font-medium italic opacity-70 leading-relaxed max-w-xs">
                La plateforme de mise en relation 1-to-1 entre apprenants et formateurs certifiés en Tunisie, propulsée par l'IA EduBot et LLaMA 3.1.
              </p>
              <div className="flex gap-3 pt-2">
                {['f','in','tw','ig'].map((s,i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600 transition-all flex items-center justify-center cursor-pointer font-black text-xs text-blue-200 hover:text-white">{s}</div>
                ))}
              </div>
            </div>
            <div className="lg:w-2/3">
              <div className="mb-8">
                <h3 className="text-4xl font-black tracking-tighter italic leading-tight">Parlons de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">votre avenir.</span></h3>
                <p className="text-blue-200 opacity-60 text-base font-medium italic mt-2">Nos experts pédagogiques sont à votre disposition pour concevoir votre parcours de réussite.</p>
              </div>
              <form className="space-y-5" onSubmit={e => { e.preventDefault(); navigate('/contact'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" placeholder="Prénom" className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm"/>
                  <input type="email" placeholder="Email" className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="tel" placeholder="Téléphone" className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm"/>
                  <select className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-blue-300/60 outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold text-sm">
                    <option value="">Centre le plus proche…</option>
                    {centers.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                  </select>
                </div>
                <textarea placeholder="Votre projet de formation…" rows={3}
                  className="w-full bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm resize-none"/>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button type="submit"
                    className="sm:w-auto w-full bg-[#F27438] hover:bg-[#E85D1C] text-white font-black py-5 px-10 rounded-2xl shadow-2xl shadow-orange-900/30 transition-all flex items-center justify-center gap-3 text-base italic active:scale-95">
                    Envoyer ma demande <Send size={20}/>
                  </button>
                  <div className="flex items-center gap-6">
                    <a href="tel:+21694249424" className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors group">
                      <div className="bg-blue-600/30 p-3 rounded-xl group-hover:bg-blue-500 transition-all"><Phone size={18}/></div>
                      <span className="font-bold text-sm">+216 94 24 94 24</span>
                    </a>
                    <a href="mailto:contact@edumatch.tn" className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors group">
                      <div className="bg-blue-600/30 p-3 rounded-xl group-hover:bg-blue-500 transition-all"><Mail size={18}/></div>
                      <span className="font-bold text-sm">contact@edumatch.tn</span>
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10"/>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-black text-white/25 italic tracking-widest uppercase">© {new Date().getFullYear()} EduMatch Platform. Made in Tunisia.</p>
          <div className="flex gap-10 font-black text-xs uppercase tracking-[0.3em] text-white/30 italic">
            {['Privacy','Terms','Careers','Help'].map(f => <a key={f} href="#" className="hover:text-blue-400 transition-colors">{f}</a>)}
          </div>
          <div className="flex items-center gap-4">
            {centers.map(c => <span key={c.city} className="text-[10px] font-black text-white/25 uppercase tracking-wider">{c.city}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;