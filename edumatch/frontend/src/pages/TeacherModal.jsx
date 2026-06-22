import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Sparkles, CheckCircle2, ArrowUpRight, Star, BookOpen, Calendar, Phone, Mail, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Navbar fixe identique à Landing ── */
const ModalNavbar = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 right-0 z-[300] bg-white/90 backdrop-blur-2xl shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span onClick={() => { onClose(); navigate('/'); }}
          className="text-2xl font-black tracking-tighter text-blue-600 cursor-pointer hover:scale-105 transition-transform select-none">
          EDUMATCH
        </span>
        <div className="hidden md:flex gap-6 font-bold text-xs uppercase tracking-[0.18em] text-gray-500">
          {[
            { label: 'Accueil',    href: '/#accueil'    },
            { label: 'Propos',     href: '/#propos'     },
            { label: 'Pourquoi',   href: '/#pourquoi'   },
            { label: 'Écosystème', href: '/#ecosystème' },
            { label: 'Centres',    href: '/#centres'    },
          ].map(l => (
            <a key={l.label} href={l.href} onClick={onClose}
              className="hover:text-blue-600 transition-colors relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"/>
            </a>
          ))}
        </div>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X size={20} className="text-gray-500"/>
        </button>
      </div>
    </div>
  );
};

/* ── Mascotte formateurs ── */
const TeacherGroupMascot = () => (
  <svg viewBox="0 0 500 430" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="tmBg" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#F5F3FF"/>
        <stop offset="100%" stopColor="#EDE9FE"/>
      </radialGradient>
      <radialGradient id="tGrad1" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#C4B5FD"/>
        <stop offset="50%" stopColor="#8B5CF6"/>
        <stop offset="100%" stopColor="#6D28D9"/>
      </radialGradient>
      <radialGradient id="tGrad2" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="50%" stopColor="#0EA5E9"/>
        <stop offset="100%" stopColor="#0284C7"/>
      </radialGradient>
      <radialGradient id="tGrad3" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#6EE7B7"/>
        <stop offset="50%" stopColor="#10B981"/>
        <stop offset="100%" stopColor="#059669"/>
      </radialGradient>
      <radialGradient id="tGrad4" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FCA5A5"/>
        <stop offset="50%" stopColor="#F87171"/>
        <stop offset="100%" stopColor="#EF4444"/>
      </radialGradient>
      <filter id="tmGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="tmShadow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6D28D9" floodOpacity="0.18"/>
      </filter>
    </defs>

    {/* Fond */}
    <rect x="0" y="0" width="500" height="430" rx="24" fill="url(#tmBg)"/>

    {/* Cercles déco fond */}
    <circle cx="70" cy="70" r="45" fill="#DDD6FE" opacity="0.3"/>
    <circle cx="430" cy="370" r="55" fill="#C4B5FD" opacity="0.2"/>
    <circle cx="450" cy="60" r="28" fill="#DDD6FE" opacity="0.22"/>
    <circle cx="55" cy="370" r="32" fill="#C4B5FD" opacity="0.18"/>

    {/* ── MASCOTTE PRINCIPALE — professeur avec lunettes rondes ── */}
    <g transform="translate(175, 100)" filter="url(#tmShadow)">
      {/* Corps violet */}
      <ellipse cx="75" cy="195" rx="80" ry="72" fill="url(#tGrad1)"/>
      {/* Reflet */}
      <ellipse cx="48" cy="145" rx="22" ry="13" fill="white" opacity="0.22" transform="rotate(-18 48 145)"/>
      {/* Cravate */}
      <polygon points="75,220 82,250 68,250" fill="#4C1D95"/>
      <polygon points="75,250 80,270 70,270" fill="#5B21B6"/>
      {/* Chemise / col */}
      <path d="M50 220 Q75 235 100 220 L95 210 Q75 225 55 210Z" fill="white" opacity="0.3"/>
      {/* Tête */}
      <ellipse cx="75" cy="115" rx="58" ry="62" fill="#FBBF7A"/>
      {/* Cheveux / béret */}
      <ellipse cx="75" cy="68" rx="45" ry="14" fill="#1E293B"/>
      <path d="M33 68 Q75 35 117 68" fill="#1E293B"/>
      <rect x="112" y="62" width="10" height="18" fill="#1E293B"/>
      {/* Lunettes rondes */}
      <circle cx="60" cy="115" r="16" fill="none" stroke="#1E293B" strokeWidth="3"/>
      <circle cx="90" cy="115" r="16" fill="none" stroke="#1E293B" strokeWidth="3"/>
      <line x1="76" y1="115" x2="74" y2="115" stroke="#1E293B" strokeWidth="2.5"/>
      <line x1="44" y1="112" x2="28" y2="108" stroke="#1E293B" strokeWidth="2"/>
      <line x1="106" y1="112" x2="122" y2="108" stroke="#1E293B" strokeWidth="2"/>
      <circle cx="60" cy="115" r="10" fill="#1E293B"/>
      <circle cx="90" cy="115" r="10" fill="#1E293B"/>
      <circle cx="62" cy="112" r="4" fill="white" opacity="0.7"/>
      <circle cx="92" cy="112" r="4" fill="white" opacity="0.7"/>
      {/* Nez */}
      <ellipse cx="75" cy="128" rx="5" ry="3.5" fill="#E8A060" opacity="0.6"/>
      {/* Sourire */}
      <path d="M62 140 Q75 153 88 140" stroke="#B85530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Joues */}
      <ellipse cx="42" cy="127" rx="12" ry="8" fill="#FDA4AF" opacity="0.4"/>
      <ellipse cx="108" cy="127" rx="12" ry="8" fill="#FDA4AF" opacity="0.4"/>
      {/* Moustache fine */}
      <path d="M68 134 Q75 131 82 134" stroke="#1E293B" strokeWidth="1.5" fill="none" opacity="0.4"/>
      {/* Bras gauche avec tablette */}
      <ellipse cx="15" cy="200" rx="20" ry="12" fill="#8B5CF6" transform="rotate(-20 15 200)"/>
      {/* Tablette */}
      <rect x="-18" y="175" width="36" height="48" rx="5" fill="#1E293B"/>
      <rect x="-15" y="178" width="30" height="42" rx="3" fill="#0F172A"/>
      <rect x="-12" y="183" width="14" height="3" rx="1.5" fill="#22C55E"/>
      <rect x="-12" y="189" width="22" height="2.5" rx="1.5" fill="#3B82F6"/>
      <rect x="-12" y="195" width="18" height="2.5" rx="1.5" fill="#EAB308"/>
      <rect x="-12" y="201" width="12" height="2.5" rx="1.5" fill="#EF4444"/>
      <rect x="-12" y="207" width="20" height="2.5" rx="1.5" fill="#8B5CF6"/>
    </g>

    {/* ── MASCOTTE GAUCHE — blob bleu avec livre ── */}
    <g transform="translate(55, 190)">
      <ellipse cx="45" cy="110" rx="48" ry="44" fill="url(#tGrad2)"/>
      <ellipse cx="28" cy="80" rx="14" ry="9" fill="white" opacity="0.2" transform="rotate(-15 28 80)"/>
      <polygon points="45,62 68,82 22,82" fill="#1E3A8A"/>
      <rect x="22" y="80" width="46" height="10" rx="3" fill="#1E3A8A"/>
      <circle cx="35" cy="94" r="6" fill="#1E293B"/>
      <circle cx="55" cy="94" r="6" fill="#1E293B"/>
      <circle cx="36.5" cy="92" r="2.5" fill="white" opacity="0.7"/>
      <circle cx="56.5" cy="92" r="2.5" fill="white" opacity="0.7"/>
      <path d="M37 106 Q45 112 53 106" stroke="#B85530" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Livre */}
      <rect x="20" y="122" width="50" height="38" rx="5" fill="#F27438"/>
      <rect x="23" y="125" width="44" height="32" rx="4" fill="#FED7AA"/>
      <line x1="45" y1="125" x2="45" y2="157" stroke="#F27438" strokeWidth="1.5" opacity="0.5"/>
      <rect x="28" y="133" width="14" height="3" rx="1.5" fill="#F27438" opacity="0.6"/>
      <rect x="28" y="140" width="18" height="2.5" rx="1.5" fill="#F27438" opacity="0.4"/>
      <rect x="28" y="147" width="12" height="2.5" rx="1.5" fill="#F27438" opacity="0.4"/>
    </g>

    {/* ── MASCOTTE DROITE — blob vert avec laptop ── */}
    <g transform="translate(360, 195)">
      <ellipse cx="45" cy="108" rx="46" ry="42" fill="url(#tGrad3)"/>
      <ellipse cx="28" cy="78" rx="13" ry="8" fill="white" opacity="0.2" transform="rotate(-15 28 78)"/>
      <path d="M12 72 Q45 50 78 72 L72 82 L18 82Z" fill="#065F46"/>
      <rect x="68" y="72" width="18" height="5" rx="2.5" fill="#065F46"/>
      <circle cx="33" cy="90" r="5.5" fill="#1E293B"/>
      <circle cx="57" cy="90" r="5.5" fill="#1E293B"/>
      <circle cx="34.5" cy="88" r="2.2" fill="white" opacity="0.7"/>
      <circle cx="58.5" cy="88" r="2.2" fill="white" opacity="0.7"/>
      <path d="M35 102 Q45 108 55 102" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Laptop */}
      <rect x="18" y="122" width="54" height="36" rx="5" fill="#334155"/>
      <rect x="21" y="125" width="48" height="28" rx="3" fill="#0F172A"/>
      <rect x="25" y="130" width="18" height="3" rx="1.5" fill="#22C55E" opacity="0.8"/>
      <rect x="25" y="136" width="32" height="2.5" rx="1.5" fill="#3B82F6" opacity="0.7"/>
      <rect x="25" y="142" width="25" height="2.5" rx="1.5" fill="#EAB308" opacity="0.6"/>
      <rect x="14" y="158" width="62" height="6" rx="3" fill="#475569"/>
    </g>

    {/* ── MASCOTTE PETITE HAUT GAUCHE — blob rose ── */}
    <g transform="translate(30, 85)">
      <ellipse cx="32" cy="75" rx="32" ry="30" fill="url(#tGrad4)"/>
      <circle cx="24" cy="67" r="4.5" fill="#1E293B"/>
      <circle cx="40" cy="67" r="4.5" fill="#1E293B"/>
      <circle cx="25" cy="65.5" r="1.8" fill="white" opacity="0.7"/>
      <circle cx="41" cy="65.5" r="1.8" fill="white" opacity="0.7"/>
      <path d="M27 78 Q32 83 37 78" stroke="#B91C1C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Nœud papillon */}
      <polygon points="28,88 32,93 36,88 32,85" fill="#DC2626"/>
    </g>

    {/* ── MASCOTTE PETITE HAUT DROITE — blob orange ── */}
    <g transform="translate(400, 80)">
      <ellipse cx="32" cy="72" rx="30" ry="28" fill="#FBBF7A"/>
      <ellipse cx="20" cy="55" rx="11" ry="7" fill="white" opacity="0.2" transform="rotate(-12 20 55)"/>
      <path d="M8 55 Q32 38 56 55 L50 63 L14 63Z" fill="#B45309"/>
      <circle cx="24" cy="69" r="4" fill="#1E293B"/>
      <circle cx="40" cy="69" r="4" fill="#1E293B"/>
      <circle cx="25" cy="67.5" r="1.6" fill="white" opacity="0.7"/>
      <circle cx="41" cy="67.5" r="1.6" fill="white" opacity="0.7"/>
      <path d="M26 80 Q32 86 38 80" stroke="#B45309" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </g>

    {/* ── GRAPHIQUE ANALYTICS — coin bas droite ── */}
    <g transform="translate(390, 260)" filter="url(#tmGlow)">
      <rect x="0" y="0" width="90" height="70" rx="12" fill="white" opacity="0.95" stroke="#E9D5FF" strokeWidth="1.5"/>
      <rect x="0" y="0" width="90" height="22" rx="12" fill="#6D28D9" opacity="0.12"/>
      <rect x="0" y="11" width="90" height="11" fill="#6D28D9" opacity="0.12"/>
      {/* Mini barres */}
      <rect x="12" y="42" width="10" height="18" rx="3" fill="#8B5CF6" opacity="0.7"/>
      <rect x="26" y="34" width="10" height="26" rx="3" fill="#6D28D9" opacity="0.8"/>
      <rect x="40" y="38" width="10" height="22" rx="3" fill="#A78BFA" opacity="0.7"/>
      <rect x="54" y="30" width="10" height="30" rx="3" fill="#7C3AED" opacity="0.8"/>
      <rect x="68" y="36" width="10" height="24" rx="3" fill="#8B5CF6" opacity="0.7"/>
      <line x1="8" y1="62" x2="82" y2="62" stroke="#E9D5FF" strokeWidth="1"/>
    </g>

    {/* ── ÉTOILE / CERT badge coin bas gauche ── */}
    <g transform="translate(30, 310)" filter="url(#tmGlow)">
      <rect x="0" y="0" width="82" height="46" rx="12" fill="white" opacity="0.9" stroke="#DDD6FE" strokeWidth="1.5"/>
      <circle cx="22" cy="23" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
      <text x="22" y="28" fontSize="14" textAnchor="middle" fill="#F59E0B">★</text>
      <rect x="40" y="12" width="34" height="5" rx="2.5" fill="#8B5CF6" opacity="0.5"/>
      <rect x="40" y="21" width="26" height="4" rx="2" fill="#C4B5FD" opacity="0.5"/>
      <rect x="40" y="30" width="30" height="4" rx="2" fill="#C4B5FD" opacity="0.4"/>
    </g>

    {/* Étoiles décoratives */}
    <text x="165" y="88" fontSize="20" fill="#F59E0B" opacity="0.75">★</text>
    <text x="350" y="78" fontSize="14" fill="#8B5CF6" opacity="0.6">✦</text>
    <text x="92" y="300" fontSize="12" fill="#0EA5E9" opacity="0.5">✦</text>
    <text x="440" y="175" fontSize="18" fill="#10B981" opacity="0.55">★</text>
  </svg>
);

const TeacherModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const features = [
    { emoji: '📅', title: 'Gestion simplifiée',  desc: "Gérez votre calendrier, vos disponibilités et vos revenus depuis un tableau de bord intuitif." },
    { emoji: '🎯', title: 'Visibilité accrue',   desc: "Profitez d'une audience qualifiée de +2 000 apprenants en Tunisie grâce à notre algorithme de matching IA." },
    { emoji: '🤝', title: 'Support dédié',       desc: "Bénéficiez d'un accompagnement technique et pédagogique par l'équipe EduMatch pour maximiser votre impact." },
  ];

  const steps = [
    { num: 1, title: "Inscription",           desc: "Créez votre compte formateur avec votre email et vos informations professionnelles." },
    { num: 2, title: "Compléter le profil",   desc: "Ajoutez vos matières, niveaux, tarifs et uploadez vos diplômes et certificats." },
    { num: 3, title: "Validation EduMatch",   desc: "Votre dossier est examiné par notre équipe pour garantir la qualité de la plateforme." },
    { num: 4, title: "Gérer les créneaux",    desc: "Publiez vos disponibilités : en ligne (lien Google Meet auto-généré) ou en présentiel." },
    { num: 5, title: "Accepter les réserv.",  desc: "Recevez les demandes d'apprenants et confirmez directement depuis votre tableau de bord." },
    { num: 6, title: "Recevoir vos revenus",  desc: "Vos revenus s'accumulent après chaque séance validée, transférables sur votre compte tunisien." },
  ];

  const testimonials = [
    { name: "Sami K.", text: "Pédagogie exceptionnelle. Le formateur a simplifié l'algèbre avec des cas pratiques concrets pour le bac.", rating: 5 },
    { name: "Ines R.", text: "Accompagnement rigoureux. J'ai monté en compétence très rapidement sur le développement web.", rating: 5 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-[201] overflow-y-auto"
        >
          {/* Navbar fixe */}
          <ModalNavbar onClose={onClose}/>

          {/* Contenu décalé sous la navbar */}
          <div className="pt-20 max-w-7xl mx-auto p-6 md:p-8 lg:p-12 space-y-16">

            {/* Hero */}
            <section className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full">
                  <Sparkles size={16} className="text-violet-500"/>
                  <span className="text-sm font-bold text-violet-600 uppercase tracking-wider">EduMatch TN — Formateurs</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-[#00153D] leading-tight">
                  Partagez votre expertise et monétisez votre savoir
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Rejoignez une communauté d'experts passionnés en Tunisie. EduMatch vous offre les outils pour gérer vos sessions, interagir avec vos apprenants et développer votre activité de formation.
                </p>
                <div className="space-y-3">
                  {[
                    "Gestion simplifiée de votre calendrier, disponibilités et revenus.",
                    "Visibilité auprès de 2 000+ apprenants qualifiés en Tunisie.",
                    "Support technique et pédagogique dédié par l'équipe EduMatch.",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 size={14} className="text-white"/>
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button onClick={() => { onClose(); navigate('/register'); }}
                    className="bg-[#00153D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors group">
                    Devenir Formateur
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
                  </button>
                  <button onClick={() => { onClose(); navigate('/formateurs'); }}
                    className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:border-violet-300 hover:text-violet-600 transition-colors">
                    Voir nos formateurs <ArrowUpRight size={20}/>
                  </button>
                </div>
              </div>
              <div className="relative h-[460px] rounded-[30px] overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 45%, #DDD6FE 100%)' }}>

                {/* Halos lumineux animés en fond */}
                <motion.div
                  animate={{ scale:[1,1.2,1], opacity:[0.25,0.1,0.25] }}
                  transition={{ duration:4.5, repeat:Infinity }}
                  className="absolute top-[-50px] right-[-50px] w-56 h-56 rounded-full"
                  style={{ background:'radial-gradient(circle, #8B5CF6, transparent)' }}/>
                <motion.div
                  animate={{ scale:[1,1.3,1], opacity:[0.18,0.07,0.18] }}
                  transition={{ duration:5.5, repeat:Infinity, delay:1.2 }}
                  className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full"
                  style={{ background:'radial-gradient(circle, #6D28D9, transparent)' }}/>

                {/* Badge "+2000 apprenants" flottant haut gauche */}
                <motion.div
                  animate={{ y:[0,-7,0] }}
                  transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut' }}
                  className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-xl border border-violet-100 flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xs font-black leading-none text-center">
                    2k+
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold leading-none">Apprenants</p>
                    <p className="text-xs font-black text-[#00153D] leading-none mt-0.5">Qualifiés ✅</p>
                  </div>
                </motion.div>

                {/* Badge "Validé EduMatch" haut droite */}
                <motion.div
                  animate={{ y:[0,-9,0] }}
                  transition={{ duration:3.8, repeat:Infinity, ease:'easeInOut', delay:0.6 }}
                  className="absolute top-4 right-4 z-10 bg-[#00153D]/90 backdrop-blur-sm text-white rounded-2xl px-3 py-2.5 shadow-xl text-center">
                  <p className="text-[18px] leading-none">✓</p>
                  <p className="text-[9px] opacity-70 font-semibold mt-0.5 leading-tight">Validé<br/>EduMatch</p>
                </motion.div>

                {/* Badge revenus bas droite */}
                <motion.div
                  animate={{ y:[0,-6,0] }}
                  transition={{ duration:3, repeat:Infinity, ease:'easeInOut', delay:1 }}
                  className="absolute bottom-14 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-xl border border-violet-100">
                  <p className="text-[9px] text-gray-400 font-semibold leading-none">Revenus / mois</p>
                  <p className="text-sm font-black text-emerald-600 leading-none mt-0.5">+850 DT 💰</p>
                </motion.div>

                {/* Badge note formateur bas gauche */}
                <motion.div
                  animate={{ y:[0,-7,0] }}
                  transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut', delay:1.5 }}
                  className="absolute bottom-14 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-xl border border-amber-100 flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="text-xs font-black text-[#00153D] leading-none">4.9 / 5</p>
                    <p className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">Note moyenne</p>
                  </div>
                </motion.div>

                {/* Mascotte principale animée */}
                <motion.div
                  animate={{ y:[0,-10,0] }}
                  transition={{ duration:4.2, repeat:Infinity, ease:'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center pt-4">
                  <TeacherGroupMascot/>
                </motion.div>

                {/* Badge EduMatch en bas centré */}
                <motion.div
                  animate={{ y:[0,-5,0] }}
                  transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut', delay:0.8 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-2 shadow-lg border border-violet-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"/>
                  <p className="text-xs font-black text-[#00153D]">EduMatch</p>
                  <span className="text-gray-300 text-xs">•</span>
                  <p className="text-[10px] text-gray-400 font-semibold">Matching IA · 6 critères</p>
                </motion.div>
              </div>
            </section>

            {/* Avantages */}
            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Pourquoi enseigner sur EduMatch ?</h3>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">Une plateforme pensée pour les formateurs tunisiens, du primaire au professionnel.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <motion.div key={i} whileHover={{ y: -8 }}
                    className="bg-white border border-gray-100 rounded-[28px] p-8 shadow-lg hover:shadow-xl transition-all text-center">
                    <div className="text-5xl mb-4">{f.emoji}</div>
                    <h4 className="text-xl font-black text-[#00153D] mb-3">{f.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Processus */}
            <section className="space-y-10">
              <div className="text-center space-y-3">
                <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Comment devenir formateur ?</h3>
                <p className="text-gray-500 text-lg">Un processus simple et structuré pour rejoindre EduMatch Tunisia.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, i) => (
                  <motion.div key={i} whileHover={{ y: -5 }}
                    className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-lg flex gap-4">
                    <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-black text-lg flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#00153D] mb-1">{step.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Avis */}
            <section className="bg-gradient-to-br from-slate-50 to-violet-50 rounded-[40px] p-8 md:p-12">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-black text-[#00153D] mb-4">Avis des apprenants</h3>
                  <p className="text-gray-500 leading-relaxed">Ce que disent nos apprenants sur l'expertise de nos formateurs certifiés.</p>
                </div>
                {testimonials.map((t, i) => (
                  <motion.div key={i} whileHover={{ y: -5 }} className="bg-white rounded-[24px] p-6 shadow-lg">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#F59E0B" className="text-amber-400"/>)}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                    <p className="font-black text-[#00153D] text-sm">{t.name}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Contact + CTA */}
            <section className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] p-8 space-y-5">
                <h3 className="text-2xl font-black text-[#00153D]">Besoin d'aide pour commencer ?</h3>
                <p className="text-gray-600 leading-relaxed">Notre équipe est disponible pour répondre à vos questions.</p>
                <a href="tel:+21694249424" className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600"><Phone size={24}/></div>
                  <div>
                    <div className="font-bold text-[#00153D]">+216 94 24 94 24</div>
                    <div className="text-sm text-gray-500">Lun–Ven, 9h–18h</div>
                  </div>
                </a>
                <a href="mailto:contact@edumatch.tn" className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Mail size={24}/></div>
                  <div>
                    <div className="font-bold text-[#00153D]">contact@edumatch.tn</div>
                    <div className="text-sm text-gray-500">Réponse sous 24h</div>
                  </div>
                </a>
              </div>
              <div className="text-center py-14 bg-gradient-to-r from-violet-600 to-purple-600 rounded-[32px] px-8 flex flex-col items-center justify-center gap-6">
                <h3 className="text-2xl md:text-3xl font-black text-white">Prêt à partager votre expertise ?</h3>
                <p className="text-violet-100 text-base max-w-sm">Plus de 2 000 apprenants en Tunisie vous attendent sur EduMatch.</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button onClick={() => { onClose(); navigate('/register'); }}
                    className="bg-white text-violet-600 px-6 py-4 rounded-2xl font-bold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
                    <BookOpen size={20}/> Devenir Formateur
                  </button>
                  <button onClick={() => { onClose(); navigate('/contact'); }}
                    className="bg-violet-700 text-white px-6 py-4 rounded-2xl font-bold hover:bg-violet-800 transition-colors flex items-center justify-center gap-2">
                    <Calendar size={20}/> Réserver un appel
                  </button>
                </div>
              </div>
            </section>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TeacherModal;