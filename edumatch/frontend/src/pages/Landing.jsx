import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, ArrowUpRight, LayoutGrid, Phone, Clock,
  MapPin, Mail, Send, Globe, ExternalLink,
  Play, Sparkles, LineChart, TrendingUp, CheckCircle2, Star,
  X, GraduationCap, BookOpen, Lightbulb, Target, Calendar, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ← AJOUTÉ
import StudentModal from './StudentModal';
import TeacherModal from './TeacherModal';
import EntrepreneurModal from './EntrepreneurModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
};

/* ═══════════════════════════════════════════════════════════════
   MASCOTTES SVG (inchangées)
═══════════════════════════════════════════════════════════════ */

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
    <text x="70" y="334" fontSize="7" fill="#374151" fontFamily="sans-serif">Chapitre 1</text>
    <text x="70" y="346" fontSize="6" fill="#6B7280" fontFamily="sans-serif">Introduction</text>
    <text x="70" y="358" fontSize="6" fill="#6B7280" fontFamily="sans-serif">à l'IA</text>
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
    <text x="94" y="283" fontSize="6" fill="#374151" fontFamily="sans-serif">Certificat d'Excellence</text>
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
    <line x1="236" y1="128" x2="256" y2="130" stroke="#1C1C1C" strokeWidth="2"/>
    <line x1="316" y1="130" x2="332" y2="128" stroke="#1C1C1C" strokeWidth="2"/>
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
    <circle cx="60" cy="280" r="5" fill="#7DD3FC" opacity="0.6"/>
    <circle cx="370" cy="300" r="7" fill="#38BDF8" opacity="0.4"/>
    <circle cx="120" cy="370" r="4" fill="#0EA5E9" opacity="0.5"/>
    <circle cx="310" cy="390" r="5" fill="#38BDF8" opacity="0.5"/>
    <circle cx="150" cy="60" r="6" fill="#7DD3FC" opacity="0.45"/>
    <circle cx="280" cy="50" r="4" fill="#38BDF8" opacity="0.5"/>
    <rect x="105" y="155" width="210" height="155" rx="18" fill="#0EA5E9" opacity="0.12"/>
    <rect x="109" y="159" width="202" height="147" rx="15" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"/>
    <rect x="122" y="176" width="90" height="6" rx="3" fill="#38BDF8" opacity="0.5"/>
    <rect x="122" y="188" width="140" height="5" rx="2.5" fill="#7DD3FC" opacity="0.4"/>
    <rect x="122" y="199" width="110" height="5" rx="2.5" fill="#38BDF8" opacity="0.35"/>
    <rect x="122" y="210" width="80" height="5" rx="2.5" fill="#7DD3FC" opacity="0.4"/>
    <rect x="122" y="222" width="130" height="5" rx="2.5" fill="#38BDF8" opacity="0.3"/>
    <rect x="122" y="234" width="60" height="5" rx="2.5" fill="#0EA5E9" opacity="0.4"/>
    <rect x="122" y="246" width="105" height="5" rx="2.5" fill="#38BDF8" opacity="0.35"/>
    <circle cx="270" cy="215" r="22" fill="#0EA5E9" opacity="0.3"/>
    <polygon points="263,205 285,215 263,225" fill="#38BDF8" opacity="0.8"/>
    <path d="M130 320 Q90 290 95 240 Q100 170 160 145 Q200 132 240 145 Q300 170 310 240 Q318 292 278 322 Q240 348 210 350 Q175 350 130 320Z"
      fill="url(#blobGrad)" opacity="0.95"/>
    <defs>
      <radialGradient id="blobGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="50%" stopColor="#38BDF8"/>
        <stop offset="100%" stopColor="#0284C7"/>
      </radialGradient>
    </defs>
    <ellipse cx="178" cy="178" rx="35" ry="22" fill="white" opacity="0.22" transform="rotate(-20 178 178)"/>
    <rect x="153" y="200" width="42" height="30" rx="12" fill="none" stroke="#1C1C1C" strokeWidth="3"/>
    <rect x="203" y="200" width="42" height="30" rx="12" fill="none" stroke="#1C1C1C" strokeWidth="3"/>
    <line x1="195" y1="215" x2="203" y2="215" stroke="#1C1C1C" strokeWidth="2.5"/>
    <line x1="153" y1="213" x2="135" y2="210" stroke="#1C1C1C" strokeWidth="2.5"/>
    <line x1="245" y1="213" x2="263" y2="210" stroke="#1C1C1C" strokeWidth="2.5"/>
    <rect x="155" y="202" width="38" height="26" rx="10" fill="#BAE6FD" opacity="0.4"/>
    <rect x="205" y="202" width="38" height="26" rx="10" fill="#BAE6FD" opacity="0.4"/>
    <circle cx="174" cy="215" r="8" fill="#1E3A8A" opacity="0.85"/>
    <circle cx="224" cy="215" r="8" fill="#1E3A8A" opacity="0.85"/>
    <circle cx="177" cy="212" r="3" fill="white" opacity="0.8"/>
    <circle cx="227" cy="212" r="3" fill="white" opacity="0.8"/>
    <path d="M187 255 Q210 272 233 255" stroke="#0C4A6E" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M187 255 Q210 272 233 255" stroke="#0C4A6E" strokeWidth="3" fill="#BAE6FD" opacity="0.3"/>
    <ellipse cx="160" cy="248" rx="14" ry="9" fill="#FB7185" opacity="0.3"/>
    <ellipse cx="260" cy="248" rx="14" ry="9" fill="#FB7185" opacity="0.3"/>
    <ellipse cx="108" cy="270" rx="22" ry="14" fill="#38BDF8" transform="rotate(-30 108 270)"/>
    <ellipse cx="315" cy="265" rx="22" ry="14" fill="#38BDF8" transform="rotate(30 315 265)"/>
    <circle cx="92" cy="258" r="8" fill="#7DD3FC"/>
    <circle cx="85" cy="272" r="7" fill="#7DD3FC"/>
    <circle cx="330" cy="256" r="8" fill="#7DD3FC"/>
    <circle cx="336" cy="270" r="7" fill="#7DD3FC"/>
    <ellipse cx="185" cy="368" rx="24" ry="30" fill="#0284C7"/>
    <ellipse cx="235" cy="368" rx="24" ry="30" fill="#0284C7"/>
    <ellipse cx="182" cy="398" rx="28" ry="16" fill="#0EA5E9"/>
    <ellipse cx="238" cy="398" rx="28" ry="16" fill="#0EA5E9"/>
    <circle cx="195" cy="170" r="4" fill="white" opacity="0.6"/>
    <circle cx="245" cy="185" r="3" fill="white" opacity="0.5"/>
    <circle cx="165" cy="330" r="3" fill="white" opacity="0.4"/>
    <g transform="translate(320, 80) rotate(15)">
      <rect width="48" height="58" rx="6" fill="#F27438"/>
      <rect x="4" y="4" width="40" height="50" rx="4" fill="#FED7AA"/>
      <line x1="10" y1="13" x2="38" y2="13" stroke="#F27438" strokeWidth="2"/>
      <line x1="10" y1="20" x2="38" y2="20" stroke="#F27438" strokeWidth="2"/>
      <line x1="10" y1="27" x2="28" y2="27" stroke="#F27438" strokeWidth="2"/>
      <line x1="24" y1="4" x2="24" y2="54" stroke="#F27438" strokeWidth="1.5" opacity="0.5"/>
    </g>
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
    <line x1="35" y1="25" x2="28" y2="24" stroke="#1C1C1C" strokeWidth="1.5"/>
    <line x1="65" y1="25" x2="72" y2="24" stroke="#1C1C1C" strokeWidth="1.5"/>
    <line x1="49" y1="26" x2="51" y2="26" stroke="#1C1C1C" strokeWidth="1.5"/>
    <circle cx="43" cy="27" r="3" fill="#1C1C1C"/>
    <circle cx="59" cy="27" r="3" fill="#1C1C1C"/>
    <path d="M43 36 Q50 43 57 36" stroke="#C0603A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M32 13 Q50 7 68 13 Q64 21 50 18 Q38 21 32 13Z" fill="#2C1810"/>
  </svg>
);
const IconBusiness = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="50" cy="27" r="17" fill="#FBBF7A"/>
    <rect x="22" y="42" width="56" height="40" rx="7" fill="#1E3A8A"/>
    <rect x="36" y="33" width="28" height="13" rx="5" fill="none" stroke="#1E3A8A" strokeWidth="3"/>
    <rect x="24" y="44" width="52" height="7" rx="2" fill="#2D4FA3"/>
    <circle cx="50" cy="54" r="5.5" fill="#F59E0B"/>
    <rect x="47" y="54" width="7" height="12" rx="2.5" fill="#F59E0B"/>
    <circle cx="43" cy="25" r="4" fill="white"/>
    <circle cx="57" cy="25" r="4" fill="white"/>
    <circle cx="44" cy="26" r="2.5" fill="#1C1C1C"/>
    <circle cx="58" cy="26" r="2.5" fill="#1C1C1C"/>
    <path d="M43 34 Q50 40 57 34" stroke="#C0603A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M34 16 Q50 10 66 16 Q62 23 50 20 Q38 23 34 16Z" fill="#1C1C1C"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════════ */
const Landing = () => {
  const navigate = useNavigate(); // ← AJOUTÉ
  const [isScrolled, setIsScrolled] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isEntrepreneurModalOpen, setIsEntrepreneurModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const centers = [
    { city: 'Tunis',    addr: 'Centre Urbain Nord, Immeuble Horizon', color: 'from-blue-600 to-indigo-500',   map: 'https://maps.google.com/?q=Tunis'    },
    { city: 'Sfax',     addr: 'Route de Gremda, Km 0.5',              color: 'from-orange-500 to-red-500',    map: 'https://maps.google.com/?q=Sfax'     },
    { city: 'Sousse',   addr: 'Boulevard du 14 Janvier',              color: 'from-purple-600 to-pink-500',   map: 'https://maps.google.com/?q=Sousse'   },
    { city: 'Monastir', addr: 'Avenue de la République',              color: 'from-emerald-500 to-teal-500',  map: 'https://maps.google.com/?q=Monastir' }
  ];

  const expertises = ['IA & Big Data', 'Développement Web', 'UI/UX Design', 'Marketing Digital', 'Cybersécurité', 'Cloud Computing', 'Finance', 'Management'];

  const whyItems = [
    {
      title: 'Une expérience unique et sur mesure',
      desc: "Onyono ne se contente pas de former, il crée un écosystème d'excellence où les compétences se rencontrent dans un cadre irréprochable."
    },
    {
      title: 'Un processus de Learning 1-to-1',
      desc: "Cet accompagnement individuel est exigé pour garantir une transmission directe du savoir et une attention totale portée à votre progression."
    },
    {
      title: 'Une garantie de résolution à 100 %',
      desc: "Onyono s'engage à ce que 100 % des problématiques rencontrées trouvent une solution concrète et efficace."
    },
    {
      title: 'Des formateurs experts et pédagogues',
      desc: 'Vous apprenez auprès de spécialistes de haut niveau qui surpassent vos attentes par leur maîtrise et leur capacité à rendre les concepts complexes accessibles.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFF] text-[#00153D] font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">

      {/* MODALES */}
      <StudentModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} />
      <TeacherModal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} />
      <EntrepreneurModal isOpen={isEntrepreneurModalOpen} onClose={() => setIsEntrepreneurModalOpen(false)} />

      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] animate-pulse"/>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px]"/>
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'py-3 bg-white/70 backdrop-blur-2xl shadow-xl' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <span className="text-3xl font-black tracking-tighter text-blue-600 cursor-pointer hover:scale-105 transition-transform select-none">ONYONO</span>
            <div className="hidden lg:flex gap-8 font-bold text-sm uppercase tracking-[0.2em] text-gray-500">
              {['Accueil', 'Propos', 'Pourquoi', 'Ecosystème', 'Centres'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-blue-600 transition-colors relative group">
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"/>
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative hidden md:block group">
              <input type="text" placeholder="Rechercher une formation..."
                className="bg-gray-100/50 border border-transparent rounded-full py-2.5 px-6 w-72 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-sm"/>
              <button className="absolute right-2 top-1.5 bg-[#00153D] p-2 rounded-full text-white group-hover:bg-blue-600 transition-colors">
                <Search size={16}/>
              </button>
            </div>
            {/* ← MODIFIÉ : Bouton utilisateur redirige vers login */}
            <button 
              onClick={() => navigate('/login')}
              className="p-2.5 border-2 border-gray-100 rounded-full hover:bg-white hover:shadow-md cursor-pointer text-gray-400 transition-all hover:text-blue-600 hover:border-blue-200"
            >
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Open Your Knowledge • Centre Class</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-6xl md:text-[88px] font-black leading-[0.85] tracking-tighter">
            Apprenez de <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F27438] to-[#E85D1C]">Nouvelles <br/> Compétences</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-500 text-xl max-w-xl font-medium leading-relaxed italic">
            Oubliez les vidéos génériques. Vivez une expérience <span className="text-blue-600 font-black">1-to-1</span> en direct avec les meilleurs experts certifiés.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
            <button className="group bg-[#00153D] text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-4 active:scale-95">
              Trouver Un Formateur <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
            </button>
            <div className="flex items-center gap-4 px-8 border-l-2 border-gray-100">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-orange-500 cursor-pointer hover:scale-110 transition-transform">
                <Play fill="currentColor" size={16}/>
              </div>
              <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Voir la démo</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:w-1/2 relative flex justify-center">
          <motion.div
            animate={{ y: [0, -22, 0], rotate: [0, 1.5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full max-w-[460px] z-10"
          >
            <HeroMascot/>
          </motion.div>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-10 left-0 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl z-20 flex items-center gap-4 border border-white">
            <div className="flex -space-x-3">
              {[21,22,23,24].map(i => <img key={i} className="w-10 h-10 rounded-full border-4 border-white shadow-md" src={`https://i.pravatar.cc/100?img=${i}`} alt=""/>)}
            </div>
            <div>
              <p className="text-xl font-black text-[#00153D] leading-none">+2k</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inscrits</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── À PROPOS ───────────────────────────────────────────── */}
      <section id="propos" className="py-32 px-6 md:px-20 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 relative min-h-[580px] w-full">
            <div className="absolute top-0 left-0 w-36 h-36 opacity-20 animate-pulse"
              style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '16px 16px' }}/>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
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
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[255px] md:w-[305px]">
              <AboutMascot2/>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}
              className="absolute bottom-16 -left-4 bg-[#FFF9F6] border-2 border-orange-100/50 p-6 rounded-[2.5rem] shadow-2xl z-30 flex items-center gap-5 min-w-[320px] backdrop-blur-sm">
              <div className="bg-[#F27438] p-5 rounded-full text-white shadow-xl shadow-orange-200"><Clock size={30} strokeWidth={3}/></div>
              <div>
                <p className="font-black text-[#1A2B49] text-lg italic tracking-tight">100 % de problèmes résolus</p>
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.1em]">100 % de talents épanouis</p>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 space-y-10">
            <div className="flex items-center gap-3 text-[#00153D] font-black text-xs uppercase tracking-[0.4em]">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"/>
              À propos d'Onyono
            </div>
            <h2 className="text-6xl md:text-7xl font-black leading-[1] tracking-tighter italic text-[#1A2B49]">
              L'endroit où vous pouvez réussir
            </h2>
            <p className="text-gray-500 text-xl leading-relaxed font-medium italic border-l-4 border-blue-50 pl-6">
              Bienvenue chez Onyono, là où l'apprentissage n'a pas de limites. Que vous soyez étudiant, professionnel ou curieux, nous transformons votre potentiel en expertise.
            </p>
            <div className="grid gap-12 pt-6">
              <motion.div whileHover={{ x: 10 }} className="flex items-start gap-8 group">
                <div className="bg-blue-50 p-6 rounded-[2rem] text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all"><LineChart size={40}/></div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#1A2B49] tracking-tight">Notre Mission</h3>
                  <p className="text-gray-400 text-lg font-medium italic">Nous créons un écosystème stimulant pour briser les barrières de l'apprentissage traditionnel.</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ x: 10 }} className="flex items-start gap-8 group">
                <div className="bg-blue-50 p-6 rounded-[2rem] text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all"><TrendingUp size={40}/></div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#1A2B49] tracking-tight">Notre Vision</h3>
                  <p className="text-gray-400 text-lg font-medium italic">Devenir le pont universel entre les experts passionnés et les talents de demain.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POURQUOI CHOISIR ONYONO ? ──────────────────────────── */}
      <section id="pourquoi" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* TEXTE GAUCHE */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
            className="lg:w-1/2 space-y-10">
            <div className="flex items-center gap-3 text-[#00153D] font-black text-xs uppercase tracking-[0.4em]">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"/>
              Découvrir Onyono
            </div>
            <h2 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tighter text-[#00153D]">
              Pourquoi choisir <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Onyono ?</span>
            </h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              La plupart des plateformes de formation en ligne vous laissent seul face à des vidéos préenregistrées. <span className="font-black text-[#00153D]">Onyono remet l'humain au centre.</span>
            </p>

            <div className="space-y-7 pt-2">
              {whyItems.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="flex items-start gap-5 group">
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

          {/* MASCOTTE DROITE + BADGES */}
          <div className="lg:w-1/2 relative flex justify-center min-h-[500px]">
            {/* Badge icône livre (coin haut gauche) */}
            <motion.div
              animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-4 z-20 w-16 h-16 bg-[#F27438] rounded-full flex items-center justify-center shadow-2xl shadow-orange-200">
              <svg viewBox="0 0 40 40" className="w-9 h-9">
                <rect x="5" y="4" width="30" height="32" rx="4" fill="white" opacity="0.9"/>
                <rect x="5" y="4" width="30" height="32" rx="4" fill="none" stroke="white" strokeWidth="2"/>
                <line x1="11" y1="13" x2="29" y2="13" stroke="#F27438" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="11" y1="20" x2="29" y2="20" stroke="#F27438" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="11" y1="27" x2="22" y2="27" stroke="#F27438" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="20" cy="8" r="3" fill="#F27438"/>
              </svg>
            </motion.div>

            {/* Badge avis (coin haut droite) */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-0 right-0 z-20 bg-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3 border border-gray-50">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                <Star size={20} fill="white" className="text-white"/>
              </div>
              <div>
                <p className="font-black text-[#00153D] text-lg leading-none">4.6<span className="text-gray-400 font-bold text-sm ml-1">(2.4k)</span></p>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Avis Moyens</p>
              </div>
            </motion.div>

            {/* Mascotte centrale */}
            <motion.div
              animate={{ y: [0, -18, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-full max-w-[400px] mt-10">
              <WhyMascot/>
            </motion.div>

            {/* Badge étudiants (coin bas droite) */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-10 right-0 z-20 bg-white rounded-2xl shadow-2xl px-5 py-4 border border-gray-50">
              <p className="font-black text-[#00153D] text-lg leading-none mb-2">
                2K+ <span className="text-gray-500 font-bold text-sm">Étudiants inscrits</span>
              </p>
              <div className="flex -space-x-3">
                {[30,31,32,33,34].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/60?img=${i}`} alt="" className="w-9 h-9 rounded-full border-3 border-white shadow"/>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXPERTISES ─────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-[0.5em] mb-8">
          <LayoutGrid size={20}/> Nos Domaines
        </div>
        <h2 className="text-6xl font-black mb-16 tracking-tighter">Élargissez vos horizons</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {expertises.map((skill, i) => (
            <motion.div key={i} whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white border-2 border-gray-50 p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] font-black text-xl hover:border-blue-100 hover:shadow-xl transition-all cursor-pointer">
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
            <p className="text-gray-400 text-xl mt-4 font-medium italic">Une plateforme, trois opportunités illimitées.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: 'Apprenants',    Icon: IconStudent,  desc: "Formations personnalisées en direct avec des mentors d'exception." },
              { title: 'Formateurs',    Icon: IconTeacher,  desc: 'Partagez votre expertise et développez votre carrière internationale.' },
              { title: 'Entrepreneurs', Icon: IconBusiness, desc: 'Recrutez les meilleurs talents pour propulser vos projets innovants.' }
            ].map((item, idx) => (
              <motion.div key={idx} whileHover={{ y: -15 }}
                className="bg-white p-12 rounded-[60px] shadow-2xl shadow-gray-100 border border-gray-50 text-center group transition-all">
                <div className="w-28 h-28 mx-auto mb-10 transform group-hover:rotate-12 group-hover:scale-110 transition-transform">
                  <item.Icon/>
                </div>
                <h3 className="text-4xl font-black mb-6 italic tracking-tight">{item.title}</h3>
                <p className="text-gray-400 mb-10 text-lg font-medium italic leading-relaxed">{item.desc}</p>
                <button 
                  onClick={() => {
                    if (item.title === 'Apprenants') setIsStudentModalOpen(true);
                    if (item.title === 'Formateurs') setIsTeacherModalOpen(true);
                    if (item.title === 'Entrepreneurs') setIsEntrepreneurModalOpen(true);
                  }}
                  className="font-black text-blue-600 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 mx-auto group-hover:scale-110 transition-transform"
                >
                  En savoir plus <ArrowUpRight size={18}/>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CENTRES ────────────────────────────────────────────── */}
      <section id="centres" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-6xl font-black tracking-tighter mb-4 italic">Nos Hubs Physiques</h2>
            <p className="text-gray-400 text-xl font-medium italic">Retrouvez l'infrastructure de pointe du Centre Class dans toute la Tunisie.</p>
          </div>
          <div className="flex items-center gap-2 font-black text-blue-600 text-sm uppercase tracking-widest bg-blue-50 px-6 py-3 rounded-full italic">
            <Globe size={18}/> Présence Nationale
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {centers.map((center, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} className="relative h-[450px] rounded-[70px] overflow-hidden shadow-2xl group">
              <div className={`absolute inset-0 bg-gradient-to-br ${center.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}/>
              <div className="absolute inset-0 p-12 flex flex-col justify-end text-white z-10">
                <MapPin size={45} className="mb-6 opacity-80"/>
                <h3 className="text-4xl font-black mb-2 tracking-tighter italic">{center.city}</h3>
                <p className="text-[11px] font-bold opacity-70 mb-10 leading-tight uppercase tracking-widest italic">{center.addr}</p>
                <a href={center.map} target="_blank" rel="noreferrer"
                  className="bg-white text-black py-5 rounded-[2rem] font-black text-center flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all shadow-xl">
                  GPS Maps <ExternalLink size={16}/>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER COMPLET (contact + liens + copyright)
      ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#00153D] text-white mt-20">

        {/* Bande contact principale */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="flex flex-col lg:flex-row gap-16 items-start">

            {/* Colonne marque */}
            <div className="lg:w-1/3 space-y-6">
              <div>
                <span className="text-5xl font-black tracking-tighter text-white">ONYONO</span>
                <p className="text-[10px] font-black uppercase opacity-30 italic tracking-[0.5em] mt-1">Experience Centre Class</p>
              </div>
              <p className="text-blue-200 text-base font-medium italic opacity-70 leading-relaxed max-w-xs">
                La plateforme d'apprentissage 1-to-1 qui remet l'humain au centre de la formation.
              </p>
              {/* Réseaux sociaux */}
              <div className="flex gap-3 pt-2">
                {['f', 'in', 'tw', 'ig'].map((s, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600 transition-all flex items-center justify-center cursor-pointer font-black text-xs text-blue-200 hover:text-white">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire contact */}
            <div className="lg:w-2/3">
              <div className="mb-8">
                <h3 className="text-4xl font-black tracking-tighter italic leading-tight">Parlons de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">votre avenir.</span></h3>
                <p className="text-blue-200 opacity-60 text-base font-medium italic mt-2">Nos experts pédagogiques sont à votre disposition pour concevoir votre parcours de réussite.</p>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" placeholder="Prénom"
                    className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm"/>
                  <input type="email" placeholder="Email"
                    className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="tel" placeholder="Téléphone"
                    className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm"/>
                  <select className="bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-blue-300/60 outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold text-sm">
                    <option value="">Centre le plus proche…</option>
                    {centers.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                  </select>
                </div>
                <textarea placeholder="Votre projet de formation…" rows={3}
                  className="w-full bg-white/8 border border-white/12 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/15 focus:border-blue-400 transition-all font-semibold placeholder:text-blue-300/30 text-sm resize-none"/>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button className="sm:w-auto w-full bg-[#F27438] hover:bg-[#E85D1C] text-white font-black py-5 px-10 rounded-2xl shadow-2xl shadow-orange-900/30 transition-all flex items-center justify-center gap-3 text-base italic active:scale-95">
                    Envoyer ma demande <Send size={20}/>
                  </button>
                  <div className="flex items-center gap-6">
                    <a href="tel:+21694249424" className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors group">
                      <div className="bg-blue-600/30 p-3 rounded-xl group-hover:bg-blue-500 transition-all"><Phone size={18}/></div>
                      <span className="font-bold text-sm">+216 94 24 94 24</span>
                    </a>
                    <a href="mailto:contact@onyono.com" className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors group">
                      <div className="bg-blue-600/30 p-3 rounded-xl group-hover:bg-blue-500 transition-all"><Mail size={18}/></div>
                      <span className="font-bold text-sm">contact@onyono.com</span>
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-white/10"/>

        {/* Bas de footer */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-black text-white/25 italic tracking-widest uppercase">
            © {new Date().getFullYear()} Onyono Platform. Made in Tunisia.
          </p>
          <div className="flex gap-10 font-black text-xs uppercase tracking-[0.3em] text-white/30 italic">
            {['Privacy', 'Terms', 'Careers', 'Help'].map(f => (
              <a key={f} href="#" className="hover:text-blue-400 transition-colors">{f}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {centers.map(c => (
              <a key={c.city} href={c.map} target="_blank" rel="noreferrer"
                className="text-[10px] font-black text-white/25 hover:text-blue-400 uppercase tracking-wider transition-colors">{c.city}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;