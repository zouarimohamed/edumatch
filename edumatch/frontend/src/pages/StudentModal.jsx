import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Sparkles, CheckCircle2, ArrowUpRight, BookOpen, Search, MessageCircle, Bot } from 'lucide-react';
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

/* ── Mascotte apprenant ── */
const StudentModalMascot = () => (
  <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#EFF6FF"/>
        <stop offset="100%" stopColor="#DBEAFE"/>
      </radialGradient>
      <radialGradient id="blobGradient" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="50%" stopColor="#0EA5E9"/>
        <stop offset="100%" stopColor="#0284C7"/>
      </radialGradient>
      <radialGradient id="screenGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#1E40AF"/>
        <stop offset="100%" stopColor="#1E3A8A"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Fond dégradé */}
    <rect x="0" y="0" width="500" height="420" rx="24" fill="url(#bgGrad)"/>

    {/* Cercles décoratifs fond */}
    <circle cx="60" cy="60" r="40" fill="#BFDBFE" opacity="0.3"/>
    <circle cx="440" cy="360" r="50" fill="#93C5FD" opacity="0.2"/>
    <circle cx="460" cy="80" r="25" fill="#BFDBFE" opacity="0.25"/>
    <circle cx="50" cy="350" r="30" fill="#93C5FD" opacity="0.2"/>

    {/* Fenêtre / tableau interactif en haut à gauche */}
    <rect x="30" y="25" width="145" height="105" rx="12" fill="white" stroke="#BFDBFE" strokeWidth="1.5" filter="url(#glow)"/>
    <rect x="30" y="25" width="145" height="28" rx="12" fill="#1E3A8A"/>
    <rect x="30" y="40" width="145" height="13" fill="#1E3A8A"/>
    <circle cx="46" cy="39" r="5" fill="#EF4444" opacity="0.8"/>
    <circle cx="60" cy="39" r="5" fill="#F59E0B" opacity="0.8"/>
    <circle cx="74" cy="39" r="5" fill="#10B981" opacity="0.8"/>
    <rect x="42" y="62" width="100" height="6" rx="3" fill="#3B82F6" opacity="0.7"/>
    <rect x="42" y="74" width="75" height="5" rx="2.5" fill="#60A5FA" opacity="0.5"/>
    <rect x="42" y="84" width="90" height="5" rx="2.5" fill="#60A5FA" opacity="0.4"/>
    <rect x="42" y="94" width="60" height="5" rx="2.5" fill="#60A5FA" opacity="0.5"/>
    <rect x="42" y="106" width="80" height="5" rx="2.5" fill="#3B82F6" opacity="0.35"/>

    {/* Tableau blanc / écran droite */}
    <rect x="325" y="20" width="148" height="115" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#glow)"/>
    <rect x="325" y="20" width="148" height="28" rx="12" fill="url(#screenGrad)"/>
    <rect x="325" y="35" width="148" height="13" fill="#1E3A8A"/>
    <text x="399" y="36" fontSize="10" fill="white" textAnchor="middle" fontFamily="monospace" fontWeight="bold">EduMatch IA</text>
    {/* Graphique dans l'écran */}
    <rect x="338" y="58" width="12" height="30" rx="3" fill="#3B82F6" opacity="0.7"/>
    <rect x="355" y="50" width="12" height="38" rx="3" fill="#0EA5E9" opacity="0.8"/>
    <rect x="372" y="62" width="12" height="26" rx="3" fill="#6366F1" opacity="0.7"/>
    <rect x="389" y="45" width="12" height="43" rx="3" fill="#10B981" opacity="0.8"/>
    <rect x="406" y="55" width="12" height="33" rx="3" fill="#F59E0B" opacity="0.7"/>
    <rect x="423" y="48" width="12" height="40" rx="3" fill="#EF4444" opacity="0.6"/>
    <line x1="335" y1="92" x2="460" y2="92" stroke="#E2E8F0" strokeWidth="1"/>
    <text x="360" y="107" fontSize="8" fill="#94A3B8" textAnchor="middle" fontFamily="sans-serif">Scores de matching</text>

    {/* Mascotte principale — blob bleu agrandi */}
    <ellipse cx="250" cy="295" rx="105" ry="95" fill="url(#blobGradient)"/>
    {/* Reflet brillant */}
    <ellipse cx="205" cy="240" rx="30" ry="18" fill="white" opacity="0.25" transform="rotate(-18 205 240)"/>

    {/* Toque de diplôme */}
    <polygon points="250,182 298,218 202,218" fill="#1E3A8A"/>
    <rect x="202" y="216" width="96" height="14" rx="4" fill="#1E3A8A"/>
    <rect x="294" y="216" width="5" height="24" fill="#F59E0B"/>
    <circle cx="296" cy="244" r="7" fill="#F59E0B"/>

    {/* Lunettes stylées */}
    <rect x="210" y="256" width="42" height="30" rx="13" fill="none" stroke="#1E293B" strokeWidth="3"/>
    <rect x="258" y="256" width="42" height="30" rx="13" fill="none" stroke="#1E293B" strokeWidth="3"/>
    <line x1="252" y1="271" x2="258" y2="271" stroke="#1E293B" strokeWidth="2.5"/>
    <line x1="210" y1="269" x2="192" y2="265" stroke="#1E293B" strokeWidth="2.5"/>
    <line x1="300" y1="269" x2="318" y2="265" stroke="#1E293B" strokeWidth="2.5"/>
    {/* Verres */}
    <rect x="213" y="259" width="36" height="24" rx="11" fill="#BAE6FD" opacity="0.45"/>
    <rect x="261" y="259" width="36" height="24" rx="11" fill="#BAE6FD" opacity="0.45"/>
    {/* Yeux */}
    <circle cx="231" cy="271" r="7.5" fill="#1E293B"/>
    <circle cx="279" cy="271" r="7.5" fill="#1E293B"/>
    <circle cx="233" cy="268" r="3" fill="white" opacity="0.8"/>
    <circle cx="281" cy="268" r="3" fill="white" opacity="0.8"/>

    {/* Sourire */}
    <path d="M238 298 Q250 312 262 298" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round"/>

    {/* Joues roses */}
    <ellipse cx="200" cy="283" rx="14" ry="9" fill="#FDA4AF" opacity="0.45"/>
    <ellipse cx="300" cy="283" rx="14" ry="9" fill="#FDA4AF" opacity="0.45"/>

    {/* Bras gauche tenant un livre */}
    <ellipse cx="148" cy="295" rx="30" ry="15" fill="#0EA5E9" transform="rotate(-25 148 295)"/>
    <rect x="100" y="278" width="38" height="50" rx="6" fill="#F27438"/>
    <rect x="103" y="281" width="32" height="44" rx="5" fill="#FED7AA"/>
    <line x1="119" y1="285" x2="119" y2="321" stroke="#F27438" strokeWidth="1.5" opacity="0.6"/>
    <rect x="107" y="290" width="20" height="3" rx="1.5" fill="#F27438" opacity="0.6"/>
    <rect x="107" y="298" width="24" height="2.5" rx="1.5" fill="#F27438" opacity="0.4"/>
    <rect x="107" y="305" width="18" height="2.5" rx="1.5" fill="#F27438" opacity="0.4"/>

    {/* Laptop / tablette devant */}
    <rect x="182" y="348" width="136" height="12" rx="6" fill="#334155"/>
    <rect x="192" y="308" width="116" height="44" rx="6" fill="#1E293B"/>
    <rect x="196" y="312" width="108" height="36" rx="4" fill="#0F172A"/>
    <rect x="202" y="318" width="42" height="3.5" rx="2" fill="#22C55E" opacity="0.8"/>
    <rect x="202" y="325" width="65" height="3" rx="1.5" fill="#3B82F6" opacity="0.7"/>
    <rect x="202" y="331" width="50" height="3" rx="1.5" fill="#EAB308" opacity="0.6"/>
    <rect x="202" y="337" width="35" height="3" rx="1.5" fill="#EF4444" opacity="0.5"/>

    {/* Badge score flottant */}
    <rect x="328" y="240" width="88" height="36" rx="18" fill="#00153D" opacity="0.92" filter="url(#glow)"/>
    <text x="372" y="254" fontSize="9" fill="#94A3B8" textAnchor="middle" fontFamily="sans-serif">Score matching</text>
    <text x="372" y="268" fontSize="13" fill="#4ADE80" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">94 / 100</text>

    {/* Badge EduBot flottant en bas gauche */}
    <rect x="28" y="330" width="110" height="36" rx="18" fill="#1E3A8A" opacity="0.9" filter="url(#glow)"/>
    <text x="83" y="344" fontSize="9" fill="#93C5FD" textAnchor="middle" fontFamily="sans-serif">EduBot IA</text>
    <text x="83" y="358" fontSize="11" fill="white" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">Prêt ! 🎯</text>

    {/* Étoiles décoratives */}
    <text x="148" y="200" fontSize="18" fill="#F59E0B" opacity="0.8">★</text>
    <text x="340" y="175" fontSize="14" fill="#F27438" opacity="0.65">✦</text>
    <text x="80" y="240" fontSize="11" fill="#3B82F6" opacity="0.55">✦</text>
    <text x="420" y="300" fontSize="16" fill="#818CF8" opacity="0.5">★</text>
  </svg>
);

const StudentModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const learnerTypes = [
    { title: "Primaire & Collège", desc: "Soutien scolaire ciblé pour les classes de 1ère à 9ème année, préparation au Brevet avec des méthodes adaptées.", color: "from-pink-400 to-rose-400", emoji: "📚" },
    { title: "Lycée & Bac",        desc: "Préparation intensive au Baccalauréat toutes sections (Math, Sciences, Lettres, Éco) avec des profs expérimentés.", color: "from-blue-400 to-indigo-400", emoji: "🎓" },
    { title: "Étudiant Supérieur", desc: "Approfondissement universitaire : programmation, IA, finance, marketing et préparation aux partiels.",               color: "from-violet-400 to-purple-400", emoji: "💻" },
    { title: "Professionnel",      desc: "Montée en compétences : développement web, cybersécurité, cloud, management et langues.",                          color: "from-emerald-400 to-teal-400", emoji: "💼" },
  ];

  const steps = [
    { num: 1, title: "Créer votre compte", desc: "Inscrivez-vous gratuitement en tant qu'étudiant avec votre email." },
    { num: 2, title: "Renseignez votre niveau", desc: "Indiquez votre classe et votre ville en Tunisie." },
    { num: 3, title: "Discutez avec EduBot", desc: "Dites 'Je cherche un prof de maths pour le bac à Sfax' — EduBot comprend tout !" },
    { num: 4, title: "Recevez votre Top 3", desc: "Notre algorithme calcule un score de compatibilité sur 100 avec les 3 meilleurs profs." },
    { num: 5, title: "Réservez votre séance", desc: "Choisissez un créneau, en ligne (Google Meet auto-généré) ou en présentiel." },
    { num: 6, title: "Progressez et évaluez", desc: "Laissez un avis après la séance et suivez votre progression." },
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                  <Sparkles size={16} className="text-blue-500"/>
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">EduMatch TN — Apprenants</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-[#00153D] leading-tight">
                  Trouvez votre formateur idéal grâce à l'IA
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Fini les recherches interminables. EduMatch vous connecte aux meilleurs professeurs certifiés en Tunisie en quelques secondes grâce à notre IA EduBot et notre algorithme de matching multicritères.
                </p>
                <div className="space-y-3">
                  {[
                    "Chatbot EduBot qui comprend vos besoins en langage naturel.",
                    "Score de compatibilité sur 100 points selon 6 critères pondérés.",
                    "Cours en ligne via Google Meet (lien auto-généré) ou présentiel.",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 size={14} className="text-white"/>
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button onClick={() => { onClose(); navigate('/register'); }}
                    className="bg-[#00153D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors group">
                    S'inscrire gratuitement
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
                  </button>
                  {/* → /login */}
                  <button onClick={() => { onClose(); navigate('/login'); }}
                    className="border-2 border-blue-200 text-blue-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-50 transition-colors">
                    <Bot size={20}/>
                    Discuter avec EduBot
                  </button>
                </div>
              </div>
              <div className="relative h-[440px] rounded-[30px] overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #E0E7FF 100%)' }}>

                {/* Cercles décoratifs animés en fond */}
                <motion.div
                  animate={{ scale:[1,1.15,1], opacity:[0.3,0.12,0.3] }}
                  transition={{ duration:4, repeat:Infinity }}
                  className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full"
                  style={{ background:'radial-gradient(circle, #93C5FD, transparent)' }}/>
                <motion.div
                  animate={{ scale:[1,1.2,1], opacity:[0.2,0.08,0.2] }}
                  transition={{ duration:5, repeat:Infinity, delay:1 }}
                  className="absolute bottom-[-30px] left-[-30px] w-40 h-40 rounded-full"
                  style={{ background:'radial-gradient(circle, #818CF8, transparent)' }}/>

                {/* Badge score flottant en haut à gauche */}
                <motion.div
                  animate={{ y:[0,-6,0], opacity:[0.9,1,0.9] }}
                  transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
                  className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg border border-blue-100 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black">94</div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold leading-none">Score matching</p>
                    <p className="text-xs font-black text-[#00153D] leading-none mt-0.5">Excellent ✨</p>
                  </div>
                </motion.div>

                {/* Badge formateurs trouvés en haut à droite */}
                <motion.div
                  animate={{ y:[0,-8,0] }}
                  transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut', delay:0.5 }}
                  className="absolute top-4 right-4 z-10 bg-[#00153D]/90 backdrop-blur-sm text-white rounded-2xl px-3 py-2 shadow-lg text-center">
                  <p className="text-lg font-black leading-none">3</p>
                  <p className="text-[9px] opacity-70 font-semibold mt-0.5">Formateurs<br/>trouvés</p>
                </motion.div>

                {/* Mascotte principale animée */}
                <motion.div
                  animate={{ y:[0,-10,0] }}
                  transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center pt-6">
                  <StudentModalMascot/>
                </motion.div>

                {/* Badge LLaMA en bas */}
                <motion.div
                  animate={{ y:[0,-5,0] }}
                  transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut', delay:1.2 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-2 shadow-lg border border-indigo-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                  <p className="text-xs font-black text-[#00153D]">EduBot</p>
                  <span className="text-gray-300 text-xs">•</span>
                  <p className="text-[10px] text-gray-400 font-semibold">LLaMA 3.1 · Groq API</p>
                </motion.div>
              </div>
            </section>

            {/* Types d'apprenants */}
            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Pour tous les niveaux</h3>
                <p className="text-gray-500 text-lg">EduMatch couvre tout le système éducatif tunisien, du primaire à l'université.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {learnerTypes.map((type, i) => (
                  <motion.div key={i} whileHover={{ y: -8 }}
                    onClick={() => { onClose(); navigate('/formateurs'); }}
                    className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-3xl`}>
                      {type.emoji}
                    </div>
                    <h4 className="text-xl font-black text-center text-[#00153D] mb-3">{type.title}</h4>
                    <p className="text-gray-500 text-sm text-center leading-relaxed">{type.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Comment ça marche */}
            <section className="space-y-10">
              <div className="text-center space-y-3">
                <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Comment ça marche ?</h3>
                <p className="text-gray-500 text-lg">Un parcours fluide de l'inscription au premier cours.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, i) => (
                  <motion.div key={i} whileHover={{ y: -5 }}
                    className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-lg flex gap-4">
                    <div className="w-10 h-10 bg-[#00153D] text-white rounded-full flex items-center justify-center font-black text-lg flex-shrink-0">
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

            {/* CTA */}
            <section className="text-center py-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] px-8">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à réussir vos examens ?</h3>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Rejoignez plus de 2 000 apprenants qui ont déjà trouvé leur formateur idéal sur EduMatch.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => { onClose(); navigate('/register'); }}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  <BookOpen size={20}/> Créer mon compte
                </button>
                <button onClick={() => { onClose(); navigate('/formateurs'); }}
                  className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                  <Search size={20}/> Voir les formateurs
                </button>
              </div>
            </section>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudentModal;