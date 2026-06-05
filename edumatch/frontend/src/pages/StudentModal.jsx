import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Sparkles, CheckCircle2, ArrowUpRight, BookOpen, Calendar, Bot, Search, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* Mascotte Apprenant - Blob bleu avec écrans holographiques */
const StudentModalMascot = () => (
  <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Fond de classe */}
    <rect x="0" y="0" width="500" height="400" rx="20" fill="#F0F9FF"/>
    
    {/* Fenêtre */}
    <rect x="50" y="20" width="120" height="100" rx="8" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="2"/>
    <rect x="60" y="30" width="100" height="80" rx="4" fill="#DBEAFE"/>
    {/* Bâtiments ville */}
    <rect x="70" y="60" width="15" height="40" fill="#94A3B8"/>
    <rect x="90" y="50" width="20" height="50" fill="#64748B"/>
    <rect x="115" y="70" width="15" height="30" fill="#94A3B8"/>
    <rect x="135" y="55" width="18" height="45" fill="#64748B"/>
    
    {/* Tableau blanc */}
    <rect x="320" y="25" width="150" height="110" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
    <rect x="330" y="35" width="130" height="90" rx="4" fill="#F8FAFC"/>
    {/* Contenu tableau */}
    <rect x="340" y="50" width="80" height="6" rx="3" fill="#3B82F6" opacity="0.6"/>
    <rect x="340" y="62" width="60" height="4" rx="2" fill="#60A5FA" opacity="0.4"/>
    <rect x="340" y="70" width="70" height="4" rx="2" fill="#60A5FA" opacity="0.4"/>
    <rect x="340" y="78" width="50" height="4" rx="2" fill="#60A5FA" opacity="0.4"/>
    <circle cx="420" cy="75" r="15" fill="none" stroke="#F59E0B" strokeWidth="2"/>
    <line x1="410" y1="65" x2="430" y2="85" stroke="#F59E0B" strokeWidth="2"/>
    
    {/* Mascotte principale - Blob bleu */}
    <ellipse cx="250" cy="280" rx="90" ry="80" fill="url(#blobGradient)"/>
    <defs>
      <radialGradient id="blobGradient" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="50%" stopColor="#0EA5E9"/>
        <stop offset="100%" stopColor="#0284C7"/>
      </radialGradient>
    </defs>
    
    {/* Reflet */}
    <ellipse cx="210" cy="240" rx="25" ry="15" fill="white" opacity="0.3" transform="rotate(-15)"/>
    
    {/* Toque diplômé */}
    <polygon points="250,180 290,215 210,215" fill="#1E3A8A"/>
    <rect x="210" y="213" width="80" height="12" rx="3" fill="#1E3A8A"/>
    <rect x="285" y="213" width="4" height="20" fill="#F59E0B"/>
    <circle cx="287" cy="238" r="6" fill="#F59E0B"/>
    
    {/* Lunettes */}
    <rect x="215" y="255" width="35" height="25" rx="10" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
    <rect x="255" y="255" width="35" height="25" rx="10" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
    <line x1="250" y1="267" x2="255" y2="267" stroke="#1E293B" strokeWidth="2"/>
    <line x1="215" y1="265" x2="200" y2="262" stroke="#1E293B" strokeWidth="2"/>
    <line x1="290" y1="265" x2="305" y2="262" stroke="#1E293B" strokeWidth="2"/>
    {/* Verres */}
    <rect x="217" y="257" width="31" height="21" rx="8" fill="#BAE6FD" opacity="0.5"/>
    <rect x="257" y="257" width="31" height="21" rx="8" fill="#BAE6FD" opacity="0.5"/>
    {/* Yeux */}
    <circle cx="232" cy="267" r="6" fill="#1E293B"/>
    <circle cx="272" cy="267" r="6" fill="#1E293B"/>
    <circle cx="234" cy="265" r="2.5" fill="white"/>
    <circle cx="274" cy="265" r="2.5" fill="white"/>
    
    {/* Bouche souriante */}
    <path d="M240 295 Q250 305 260 295" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    
    {/* Joues */}
    <ellipse cx="205" cy="280" rx="12" ry="8" fill="#FDA4AF" opacity="0.4"/>
    <ellipse cx="295" cy="280" rx="12" ry="8" fill="#FDA4AF" opacity="0.4"/>
    
    {/* Écrans holographiques flottants */}
    <g transform="translate(130, 200)">
      <rect x="0" y="0" width="80" height="60" rx="8" fill="#0EA5E9" opacity="0.15" stroke="#38BDF8" strokeWidth="1"/>
      <rect x="5" y="5" width="70" height="50" rx="6" fill="none" stroke="#7DD3FC" strokeWidth="0.5" opacity="0.5"/>
      <rect x="10" y="15" width="40" height="4" rx="2" fill="#38BDF8" opacity="0.6"/>
      <rect x="10" y="23" width="55" height="3" rx="1.5" fill="#7DD3FC" opacity="0.4"/>
      <rect x="10" y="30" width="45" height="3" rx="1.5" fill="#38BDF8" opacity="0.5"/>
      <rect x="10" y="37" width="35" height="3" rx="1.5" fill="#7DD3FC" opacity="0.4"/>
      <circle cx="60" cy="35" r="8" fill="#0EA5E9" opacity="0.3"/>
      <polygon points="57,31 65,35 57,39" fill="#38BDF8" opacity="0.8"/>
    </g>
    
    <g transform="translate(300, 220)">
      <rect x="0" y="0" width="70" height="50" rx="8" fill="#0EA5E9" opacity="0.15" stroke="#38BDF8" strokeWidth="1"/>
      <polyline points="10,40 25,30 40,35 55,20 60,25" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="55" cy="20" r="3" fill="#F59E0B"/>
    </g>
    
    {/* Autres mascottes en arrière-plan */}
    <ellipse cx="380" cy="320" rx="35" ry="30" fill="#FBBF7A" opacity="0.8"/>
    <ellipse cx="380" cy="295" rx="25" ry="22" fill="#FBBF7A" opacity="0.8"/>
    <circle cx="372" cy="292" r="4" fill="#1C1C1C" opacity="0.8"/>
    <circle cx="388" cy="292" r="4" fill="#1C1C1C" opacity="0.8"/>
    <path d="M375 302 Q380 306 385 302" stroke="#C0603A" strokeWidth="1.5" fill="none" opacity="0.8"/>
    <polygon points="380,268 400,285 360,285" fill="#1E3A8A" opacity="0.8"/>
    
    <ellipse cx="120" cy="330" rx="30" ry="25" fill="#A78BFA" opacity="0.6"/>
    <ellipse cx="120" cy="310" rx="22" ry="18" fill="#A78BFA" opacity="0.6"/>
    <circle cx="114" cy="308" r="3" fill="#1C1C1C" opacity="0.6"/>
    <circle cx="126" cy="308" r="3" fill="#1C1C1C" opacity="0.6"/>
    
    {/* Laptop sur le bureau */}
    <rect x="180" y="340" width="140" height="10" rx="5" fill="#475569"/>
    <rect x="190" y="300" width="120" height="45" rx="4" fill="#1E293B"/>
    <rect x="195" y="305" width="110" height="35" rx="2" fill="#0F172A"/>
    <rect x="200" y="310" width="40" height="3" rx="1.5" fill="#22C55E" opacity="0.7"/>
    <rect x="200" y="316" width="60" height="3" rx="1.5" fill="#3B82F6" opacity="0.7"/>
    <rect x="200" y="322" width="50" height="3" rx="1.5" fill="#EAB308" opacity="0.7"/>
    <rect x="200" y="328" width="35" height="3" rx="1.5" fill="#EF4444" opacity="0.7"/>
    
    {/* Bras tenant livre */}
    <ellipse cx="165" cy="290" rx="20" ry="12" fill="#0EA5E9" transform="rotate(-20)"/>
    <rect x="140" y="275" width="30" height="40" rx="4" fill="#F27438" transform="rotate(-10)"/>
    <rect x="143" y="278" width="24" height="34" rx="3" fill="#FED7AA" transform="rotate(-10)"/>
    <line x1="155" y1="285" x2="155" y2="305" stroke="#F27438" strokeWidth="1" transform="rotate(-10 155 295)"/>
  </svg>
);

/* Mascotte EduBot */
const EduBotMascot = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="100" cy="100" r="90" fill="#F0F9FF"/>
    <circle cx="100" cy="100" r="70" fill="#E0F2FE" opacity="0.5"/>
    
    {/* Robot EduBot */}
    <rect x="60" y="50" width="80" height="70" rx="20" fill="url(#botGrad)"/>
    <defs>
      <radialGradient id="botGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="50%" stopColor="#0EA5E9"/>
        <stop offset="100%" stopColor="#0284C7"/>
      </radialGradient>
    </defs>
    
    {/* Antennes */}
    <line x1="80" y1="50" x2="75" y2="30" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="75" cy="28" r="4" fill="#F59E0B"/>
    <line x1="120" y1="50" x2="125" y2="30" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="125" cy="28" r="4" fill="#F59E0B"/>
    
    {/* Écran visage */}
    <rect x="70" y="65" width="60" height="40" rx="10" fill="#0F172A"/>
    {/* Yeux LED */}
    <circle cx="90" cy="85" r="8" fill="#22C55E" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="110" cy="85" r="8" fill="#22C55E" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    {/* Bouche */}
    <rect x="85" y="100" width="30" height="4" rx="2" fill="#22C55E" opacity="0.6"/>
    
    {/* Corps */}
    <rect x="70" y="120" width="60" height="50" rx="15" fill="#0284C7"/>
    {/* Cœur EduMatch */}
    <text x="100" y="150" fontSize="20" textAnchor="middle" fill="white">🎓</text>
    
    {/* Bras */}
    <rect x="45" y="130" width="20" height="8" rx="4" fill="#0EA5E9"/>
    <rect x="135" y="130" width="20" height="8" rx="4" fill="#0EA5E9"/>
    
    {/* Roues */}
    <circle cx="85" cy="180" r="12" fill="#1E293B"/>
    <circle cx="115" cy="180" r="12" fill="#1E293B"/>
  </svg>
);

const StudentModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const learnerTypes = [
    {
      icon: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop",
      title: "Primaire & Collège",
      desc: "Soutien scolaire ciblé pour les classes de 1ère à 9ème année, préparation au Brevet avec des méthodes adaptées.",
      color: "from-pink-400 to-rose-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop",
      title: "Lycée & Bac",
      desc: "Préparation intensive au Baccalauréat toutes sections (Math, Sciences, Lettres, Éco) avec des profs expérimentés.",
      color: "from-blue-400 to-indigo-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop",
      title: "Étudiant Supérieur",
      desc: "Approfondissement universitaire : programmation, IA, finance, marketing et préparation aux partiels.",
      color: "from-violet-400 to-purple-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      title: "Professionnel",
      desc: "Montée en compétences et reconversion : développement web, cybersécurité, cloud, management et langues.",
      color: "from-emerald-400 to-teal-400"
    }
  ];

  const steps = [
    {
      phase: "Phase 1 : Inscription & Profil",
      items: [
        { num: 1, title: "Création de compte", desc: "Inscrivez-vous gratuitement en tant qu'étudiant avec votre email tunisien.", img: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=300&h=200&fit=crop" },
        { num: 2, title: "Renseignez votre niveau", desc: "Indiquez votre classe (Primaire, Collège, Lycée, Université) et votre ville.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" },
        { num: 3, title: "Accédez au dashboard", desc: "Votre espace personnel avec historique, réservations et messagerie.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop" }
      ]
    },
    {
      phase: "Phase 2 : Recherche Intelligente",
      items: [
        { num: 4, title: "Chat avec EduBot", desc: "Dites 'Je cherche un prof de maths pour le bac à Sfax' — EduBot comprend tout !", img: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=300&h=200&fit=crop" },
        { num: 5, title: "Matching IA", desc: "Notre algorithme calcule un score de compatibilité sur 100 avec les 3 meilleurs profs.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" }
      ]
    },
    {
      phase: "Phase 3 : Réservation & Cours",
      items: [
        { num: 6, title: "Choisissez votre créneau", desc: "Sélectionnez date, heure et mode : en ligne (Google Meet) ou présentiel.", img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&h=200&fit=crop" },
        { num: 7, title: "Confirmez et apprenez", desc: "Le professeur valide, vous recevez le lien Meet ou l'adresse du centre.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop" }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white z-[200]"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 bg-white z-[201] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between p-6 md:p-8 border-b border-gray-100 bg-white/90 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#00153D] tracking-tight">Pour les Apprenants</h2>
                  <p className="text-sm text-gray-500 font-medium">Découvrez votre parcours sur EduMatch</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group"
              >
                <X size={24} className="text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12 space-y-16">
              
              {/* Section Hero */}
              <section className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                    <Sparkles size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">EduMatch TN</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-[#00153D] leading-tight">
                    Trouvez votre formateur idéal grâce à l'IA
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Fini les recherches interminables sur Facebook. EduMatch vous connecte aux meilleurs professeurs certifiés en Tunisie en quelques secondes.
                  </p>
                  <div className="space-y-4 pt-4">
                    {[
                      "Chatbot EduBot qui comprend vos besoins en langage naturel.",
                      "Score de compatibilité sur 100 points (matière, niveau, budget, ville).",
                      "Cours en ligne via Google Meet ou présentiel dans nos centres."
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => { onClose(); navigate('/register'); }}
                      className="bg-[#00153D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors group"
                    >
                      S'inscrire gratuitement
                      <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => { onClose(); navigate('/edubot'); }}
                      className="border-2 border-blue-200 text-blue-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-50 transition-colors"
                    >
                      <Bot size={20} />
                      Essayer EduBot
                    </button>
                  </div>
                </div>
                <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[30px] overflow-hidden">
                  <StudentModalMascot />
                </div>
              </section>

              {/* Section EduBot */}
              <section className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-[40px] p-8 md:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#00153D]">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-sm uppercase tracking-wider">EduBot IA</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D] leading-tight">
                    Discutez, et laissez l'IA faire le reste
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Pas besoin de remplir des formulaires complexes. Dites simplement ce que vous cherchez et EduBot extrait automatiquement vos critères.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: <MessageCircle size={18} />, text: "Je veux un prof de physique pour le bac à Tunis" },
                      { icon: <Search size={18} />, text: "Qui enseigne le Python en ligne pour débutant ?" },
                      { icon: <Calendar size={18} />, text: "J'ai besoin de cours de maths ce weekend à Sfax" }
                    ].map((ex, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-blue-500">{ex.icon}</div>
                        <span className="text-gray-700 font-medium text-sm">"{ex.text}"</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => { onClose(); navigate('/edubot'); }}
                    className="bg-[#00153D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors group"
                  >
                    <Bot size={20} />
                    Discuter avec EduBot
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
                <div className="relative h-[350px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 scale-75" />
                  <EduBotMascot />
                </div>
              </section>

              {/* Section Types d'apprenants */}
              <section className="space-y-8">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Pour tous les niveaux</h3>
                  <p className="text-gray-500 text-lg">EduMatch couvre tout le système éducatif tunisien, du primaire à l'université.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {learnerTypes.map((type, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -8 }}
                      onClick={() => { onClose(); navigate('/formateurs'); }}
                      className="bg-white border border-gray-100 rounded-[30px] p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all group cursor-pointer"
                    >
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${type.color} p-1`}>
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          <img src={type.icon} alt={type.title} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-center text-[#00153D] mb-3">{type.title}</h4>
                      <p className="text-gray-500 text-sm text-center leading-relaxed">{type.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Section Processus */}
              <section className="space-y-12">
                <div className="text-center space-y-4">
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Processus en 3 phases</span>
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Comment ça marche ?</h3>
                  <p className="text-gray-500 text-lg">Un parcours fluide de l'inscription au premier cours.</p>
                </div>
                
                <div className="space-y-12">
                  {steps.map((phase, phaseIdx) => (
                    <div key={phaseIdx} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                        <span className="px-6 py-2 bg-blue-50 text-blue-700 font-bold rounded-full text-sm border border-blue-100">
                          {phase.phase}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                      </div>
                      <div className={`grid gap-6 ${phase.items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {phase.items.map((step) => (
                          <motion.div
                            key={step.num}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-lg shadow-gray-100/30"
                          >
                            <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
                              <img src={step.img} alt={step.title} className="w-full h-full object-cover opacity-80" />
                              <div className="absolute top-4 left-4 w-10 h-10 bg-[#00153D] text-white rounded-full flex items-center justify-center font-black text-lg">
                                {step.num}
                              </div>
                            </div>
                            <div className="p-6">
                              <h4 className="text-lg font-black text-[#00153D] mb-2">{step.title}</h4>
                              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA Final */}
              <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] px-8">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à réussir vos examens ?</h3>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Rejoignez plus de 2 000 apprenants qui ont déjà trouvé leur formateur idéal sur EduMatch.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => { onClose(); navigate('/register'); }}
                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen size={20} />
                    Créer mon compte
                  </button>
                  <button 
                    onClick={() => { onClose(); navigate('/formateurs'); }}
                    className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search size={20} />
                    Voir les formateurs
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StudentModal;