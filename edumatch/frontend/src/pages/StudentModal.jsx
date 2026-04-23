import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Sparkles, CheckCircle2, ArrowUpRight, BookOpen, Calendar } from 'lucide-react';

/* Mascotte Apprenant Modal - Blob bleu avec écrans holographiques */
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
      {/* Code lines */}
      <rect x="10" y="15" width="40" height="4" rx="2" fill="#38BDF8" opacity="0.6"/>
      <rect x="10" y="23" width="55" height="3" rx="1.5" fill="#7DD3FC" opacity="0.4"/>
      <rect x="10" y="30" width="45" height="3" rx="1.5" fill="#38BDF8" opacity="0.5"/>
      <rect x="10" y="37" width="35" height="3" rx="1.5" fill="#7DD3FC" opacity="0.4"/>
      {/* Play button */}
      <circle cx="60" cy="35" r="8" fill="#0EA5E9" opacity="0.3"/>
      <polygon points="57,31 65,35 57,39" fill="#38BDF8" opacity="0.8"/>
    </g>
    
    <g transform="translate(300, 220)">
      <rect x="0" y="0" width="70" height="50" rx="8" fill="#0EA5E9" opacity="0.15" stroke="#38BDF8" strokeWidth="1"/>
      {/* Graph */}
      <polyline points="10,40 25,30 40,35 55,20 60,25" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="55" cy="20" r="3" fill="#F59E0B"/>
    </g>
    
    {/* Autres mascottes en arrière-plan */}
    <ellipse cx="380" cy="320" rx="35" ry="30" fill="#FBBF7A" opacity="0.8"/>
    <ellipse cx="380" cy="295" rx="25" ry="22" fill="#FBBF7A" opacity="0.8"/>
    <circle cx="372" cy="292" r="4" fill="#1C1C1C" opacity="0.8"/>
    <circle cx="388" cy="292" r="4" fill="#1C1C1C" opacity="0.8"/>
    <path d="M375 302 Q380 306 385 302" stroke="#C0603A" strokeWidth="1.5" fill="none" opacity="0.8"/>
    {/* Toque petite mascotte */}
    <polygon points="380,268 400,285 360,285" fill="#1E3A8A" opacity="0.8"/>
    
    <ellipse cx="120" cy="330" rx="30" ry="25" fill="#A78BFA" opacity="0.6"/>
    <ellipse cx="120" cy="310" rx="22" ry="18" fill="#A78BFA" opacity="0.6"/>
    <circle cx="114" cy="308" r="3" fill="#1C1C1C" opacity="0.6"/>
    <circle cx="126" cy="308" r="3" fill="#1C1C1C" opacity="0.6"/>
    
    {/* Laptop sur le bureau */}
    <rect x="180" y="340" width="140" height="10" rx="5" fill="#475569"/>
    <rect x="190" y="300" width="120" height="45" rx="4" fill="#1E293B"/>
    <rect x="195" y="305" width="110" height="35" rx="2" fill="#0F172A"/>
    {/* Code sur écran */}
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

/* Mascotte Recherche Formateur */
const SearchTeacherMascot = () => (
  <svg viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Fond grille de formateurs */}
    <defs>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#F1F5F9"/>
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#E2E8F0" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="400" height="350" fill="url(#grid)" rx="20"/>
    
    {/* Grille d'avatars de formateurs */}
    {[0,1,2,3,4].map(row => 
      [0,1,2,3].map(col => {
        const x = 30 + col * 85;
        const y = 30 + row * 65;
        const isHighlighted = row === 1 && col === 1;
        return (
          <g key={`${row}-${col}`}>
            <rect x={x} y={y} width="70" height="55" rx="12" fill={isHighlighted ? "#DBEAFE" : "white"} 
              stroke={isHighlighted ? "#3B82F6" : "#E2E8F0"} strokeWidth={isHighlighted ? "2" : "1"}/>
            {/* Avatar simplifié */}
            <circle cx={x + 35} cy={y + 22} r="12" fill={isHighlighted ? "#3B82F6" : "#CBD5E1"}/>
            <rect x={x + 20} y={y + 38} width="30" height="4" rx="2" fill={isHighlighted ? "#3B82F6" : "#94A3B8"}/>
            {isHighlighted && (
              <>
                <circle cx={x + 60} cy={y + 12} r="8" fill="#F59E0B"/>
                <text x={x + 60} y={y + 16} fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">★</text>
              </>
            )}
          </g>
        );
      })
    )}
    
    {/* Mascotte principale superposée */}
    <g transform="translate(130, 80)">
      {/* Corps blob */}
      <ellipse cx="70" cy="140" rx="65" ry="55" fill="url(#searchBlobGrad)"/>
      <defs>
        <radialGradient id="searchBlobGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC"/>
          <stop offset="50%" stopColor="#0EA5E9"/>
          <stop offset="100%" stopColor="#0284C7"/>
        </radialGradient>
      </defs>
      
      {/* Toque */}
      <polygon points="70,75 100,100 40,100" fill="#1E3A8A"/>
      <rect x="40" y="98" width="60" height="10" rx="3" fill="#1E3A8A"/>
      <rect x="95" y="98" width="4" height="15" fill="#F59E0B"/>
      <circle cx="97" cy="118" r="5" fill="#F59E0B"/>
      
      {/* Lunettes */}
      <rect x="45" y="115" width="22" height="16" rx="6" fill="none" stroke="#1E293B" strokeWidth="2"/>
      <rect x="75" y="115" width="22" height="16" rx="6" fill="none" stroke="#1E293B" strokeWidth="2"/>
      <line x1="67" y1="123" x2="73" y2="123" stroke="#1E293B" strokeWidth="2"/>
      <circle cx="56" cy="123" r="4" fill="#1E293B"/>
      <circle cx="86" cy="123" r="4" fill="#1E293B"/>
      
      {/* Bouche */}
      <path d="M60 140 Q70 147 80 140" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Loupe */}
      <g transform="translate(90, 110)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#F59E0B" strokeWidth="4"/>
        <line x1="13" y1="13" x2="28" y2="28" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="0" cy="0" r="12" fill="#FEF3C7" opacity="0.3"/>
      </g>
      
      {/* Graphique flottant */}
      <g transform="translate(-20, 100)">
        <rect x="0" y="0" width="50" height="35" rx="6" fill="white" opacity="0.9" stroke="#E2E8F0"/>
        <polyline points="8,25 18,18 28,22 38,12 42,15" fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <circle cx="38" cy="12" r="3" fill="#F59E0B"/>
      </g>
    </g>
    
    {/* Barre de recherche */}
    <g transform="translate(80, 280)">
      <rect x="0" y="0" width="240" height="40" rx="20" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
      <circle cx="25" cy="20" r="8" fill="none" stroke="#94A3B8" strokeWidth="2"/>
      <line x1="31" y1="26" x2="38" y2="33" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
      <text x="50" y="25" fontSize="12" fill="#94A3B8" fontFamily="sans-serif">Rechercher un formateur...</text>
    </g>
  </svg>
);

const StudentModal = ({ isOpen, onClose }) => {
  const learnerTypes = [
    {
      icon: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop",
      title: "Élève (Enfant)",
      desc: "Un accompagnement ludique et adapté pour les plus jeunes, pour éveiller leur curiosité et renforcer leurs bases.",
      color: "from-pink-400 to-rose-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop",
      title: "Collégien / Lycéen",
      desc: "Soutien scolaire ciblé et préparation aux examens pour garantir la réussite au collège et au lycée.",
      color: "from-blue-400 to-indigo-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop",
      title: "Étudiant",
      desc: "Approfondissement des connaissances et aide à la préparation des partiels pour les études supérieures.",
      color: "from-violet-400 to-purple-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      title: "Professionnel",
      desc: "Montée en compétences et formation continue pour booster votre carrière et rester compétitif.",
      color: "from-emerald-400 to-teal-400"
    }
  ];

  const steps = [
    {
      phase: "Phase 1 : Inscription & Profil",
      items: [
        { num: 1, title: "Création de compte", desc: "Créez votre compte apprenant en quelques clics.", img: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=300&h=200&fit=crop" },
        { num: 2, title: "Informations de base", desc: "Renseignez vos informations pour personnaliser l'expérience.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" },
        { num: 3, title: "Tableau de bord", desc: "Accédez à votre espace personnel intuitif et complet.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop" }
      ]
    },
    {
      phase: "Phase 2 : Recherche & Découverte",
      items: [
        { num: 4, title: "Recherche de formateur", desc: "Trouvez l'expert idéal selon vos besoins et critères.", img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&h=200&fit=crop" },
        { num: 5, title: "Consultation de profil", desc: "Découvrez les compétences et avis de chaque formateur.", img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop" }
      ]
    },
    {
      phase: "Phase 3 : Programmation",
      items: [
        { num: 6, title: "Sélection de créneau", desc: "Choisissez l'horaire qui vous convient le mieux.", img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&h=200&fit=crop" },
        { num: 7, title: "Confirmation", desc: "Validez votre session et recevez la confirmation.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop" }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop plein écran */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white z-[200]"
          />
          
          {/* Container plein écran - MODIFIÉ */}
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
                  <p className="text-sm text-gray-500 font-medium">Découvrez votre parcours d'apprentissage sur Onyono</p>
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
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Pour les Apprenants</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-[#00153D] leading-tight">
                    Accélérez votre apprentissage avec un accompagnement sur-mesure
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Que vous soyez étudiant préparant un examen, professionnel en reconversion ou simplement curieux d'apprendre, Onyono vous connecte aux meilleurs experts pour des sessions de mentorat en direct.
                  </p>
                  <div className="space-y-4 pt-4">
                    {[
                      "Accès à des formateurs certifiés dans tous les domaines.",
                      "Sessions individuelles adaptées à votre rythme.",
                      "Outils interactifs pour un apprentissage efficace."
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[30px] overflow-hidden">
                  <StudentModalMascot />
                </div>
              </section>

              {/* Section Types d'apprenants */}
              <section className="space-y-8">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Types d'apprenants</h3>
                  <p className="text-gray-500 text-lg">Onyono accompagne chaque étape de votre parcours d'apprentissage.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {learnerTypes.map((type, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -8 }}
                      className="bg-white border border-gray-100 rounded-[30px] p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all group"
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

              {/* Section Recherche Formateur */}
              <section className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-[40px] p-8 md:p-12">
                <div className="relative h-[350px]">
                  <SearchTeacherMascot />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#00153D]">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-sm uppercase tracking-wider">Trouvez votre expert</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D] leading-tight">
                    Trouvez le formateur qui vous correspond vraiment.
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    La page Formateurs vous permet de filtrer selon votre besoin pour identifier le bon expert en quelques instants.
                  </p>
                  <button className="bg-[#00153D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors group">
                    Voir Les Formateurs
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </section>

              {/* Section Processus */}
              <section className="space-y-12">
                <div className="text-center space-y-4">
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Processus Simple</span>
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Comment ça marche ?</h3>
                  <p className="text-gray-500 text-lg">Un parcours fluide pour réussir votre apprentissage sur Onyono.</p>
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
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à commencer votre parcours ?</h3>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Rejoignez plus de 2 000 apprenants qui ont déjà transformé leur carrière avec Onyono.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <BookOpen size={20} />
                    Commencer gratuitement
                  </button>
                  <button className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                    <Calendar size={20} />
                    Réserver une démo
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