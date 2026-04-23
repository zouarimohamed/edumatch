import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Sparkles, CheckCircle2, ArrowUpRight, Star, BookOpen, Calendar } from 'lucide-react';

/* Mascotte Formateurs - Groupe de blobs */
const TeacherGroupMascot = () => (
  <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Fond */}
    <rect x="0" y="0" width="500" height="400" rx="20" fill="#F0F9FF"/>
    
    {/* Écrans flottants en arrière-plan */}
    <g opacity="0.3">
      <rect x="40" y="40" width="100" height="70" rx="10" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="2"/>
      <rect x="360" y="60" width="100" height="70" rx="10" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="2"/>
      <rect x="80" y="280" width="100" height="70" rx="10" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="2"/>
      <rect x="340" y="260" width="100" height="70" rx="10" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="2"/>
    </g>

    {/* Mascotte centrale - Leader avec béret */}
    <g transform="translate(200, 120)">
      {/* Corps */}
      <ellipse cx="50" cy="130" rx="55" ry="50" fill="url(#teacherGrad1)"/>
      <defs>
        <radialGradient id="teacherGrad1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC"/>
          <stop offset="50%" stopColor="#0EA5E9"/>
          <stop offset="100%" stopColor="#0284C7"/>
        </radialGradient>
      </defs>
      
      {/* Béret */}
      <ellipse cx="50" cy="55" rx="35" ry="12" fill="#1E293B"/>
      <path d="M20 55 Q50 25 80 55" fill="#1E293B"/>
      <rect x="75" y="50" width="8" height="15" fill="#1E293B"/>
      
      {/* Lunettes rondes */}
      <circle cx="38" cy="85" r="14" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
      <circle cx="62" cy="85" r="14" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
      <line x1="52" y1="85" x2="48" y2="85" stroke="#1E293B" strokeWidth="2"/>
      <circle cx="38" cy="85" r="8" fill="#1E293B"/>
      <circle cx="62" cy="85" r="8" fill="#1E293B"/>
      <circle cx="40" cy="83" r="3" fill="white"/>
      <circle cx="64" cy="83" r="3" fill="white"/>
      
      {/* Bouche souriante */}
      <path d="M40 105 Q50 115 60 105" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      
      {/* Joues */}
      <ellipse cx="25" cy="95" rx="10" ry="6" fill="#FDA4AF" opacity="0.4"/>
      <ellipse cx="75" cy="95" rx="10" ry="6" fill="#FDA4AF" opacity="0.4"/>
      
      {/* Tablette */}
      <rect x="25" y="115" width="50" height="35" rx="5" fill="#1E293B"/>
      <rect x="28" y="118" width="44" height="29" rx="3" fill="#0F172A"/>
      <rect x="32" y="122" width="20" height="3" rx="1.5" fill="#22C55E"/>
      <rect x="32" y="128" width="30" height="3" rx="1.5" fill="#3B82F6"/>
      <rect x="32" y="134" width="25" height="3" rx="1.5" fill="#EAB308"/>
    </g>

    {/* Mascotte gauche */}
    <g transform="translate(80, 160)">
      <ellipse cx="40" cy="100" rx="40" ry="38" fill="url(#teacherGrad2)"/>
      <defs>
        <radialGradient id="teacherGrad2" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A78BFA"/>
          <stop offset="50%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#6D28D9"/>
        </radialGradient>
      </defs>
      {/* Toque */}
      <polygon points="40,55 60,75 20,75" fill="#1E3A8A"/>
      <rect x="20" y="73" width="40" height="8" rx="2" fill="#1E3A8A"/>
      {/* Yeux */}
      <circle cx="32" cy="82" r="5" fill="#1E293B"/>
      <circle cx="48" cy="82" r="5" fill="#1E293B"/>
      <circle cx="33" cy="81" r="2" fill="white"/>
      <circle cx="49" cy="81" r="2" fill="white"/>
      {/* Bouche */}
      <path d="M34 92 Q40 97 46 92" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Livre */}
      <rect x="20" y="105" width="40" height="30" rx="3" fill="#F27438"/>
      <rect x="22" y="107" width="36" height="26" rx="2" fill="#FED7AA"/>
      <line x1="26" y1="114" x2="54" y2="114" stroke="#F27438" strokeWidth="1.5"/>
      <line x1="26" y1="120" x2="54" y2="120" stroke="#F27438" strokeWidth="1.5"/>
      <line x1="40" y1="107" x2="40" y2="133" stroke="#F27438" strokeWidth="1" opacity="0.5"/>
    </g>

    {/* Mascotte droite */}
    <g transform="translate(340, 150)">
      <ellipse cx="40" cy="100" rx="40" ry="38" fill="url(#teacherGrad3)"/>
      <defs>
        <radialGradient id="teacherGrad3" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34D399"/>
          <stop offset="50%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
      </defs>
      {/* Casquette */}
      <path d="M15 65 Q40 45 65 65 L60 75 L20 75Z" fill="#065F46"/>
      <rect x="55" y="65" width="15" height="4" rx="2" fill="#065F46"/>
      {/* Lunettes */}
      <rect x="22" y="78" width="16" height="12" rx="4" fill="none" stroke="#1E293B" strokeWidth="2"/>
      <rect x="42" y="78" width="16" height="12" rx="4" fill="none" stroke="#1E293B" strokeWidth="2"/>
      <line x1="38" y1="84" x2="42" y2="84" stroke="#1E293B" strokeWidth="1.5"/>
      <circle cx="30" cy="84" r="4" fill="#1E293B"/>
      <circle cx="50" cy="84" r="4" fill="#1E293B"/>
      {/* Bouche */}
      <path d="M32 95 Q40 100 48 95" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Ordinateur */}
      <rect x="20" y="108" width="40" height="28" rx="3" fill="#475569"/>
      <rect x="22" y="110" width="36" height="20" rx="2" fill="#0F172A"/>
      <rect x="25" y="113" width="15" height="2" rx="1" fill="#22C55E"/>
      <rect x="25" y="117" width="25" height="2" rx="1" fill="#3B82F6"/>
      <rect x="25" y="121" width="20" height="2" rx="1" fill="#EAB308"/>
    </g>

    {/* Mascotte arrière gauche */}
    <g transform="translate(130, 80)">
      <ellipse cx="30" cy="70" rx="28" ry="26" fill="#BAE6FD" opacity="0.8"/>
      <circle cx="24" cy="62" r="4" fill="#1E293B"/>
      <circle cx="36" cy="62" r="4" fill="#1E293B"/>
      <path d="M26 70 Q30 73 34 70" stroke="#1E293B" strokeWidth="1.5" fill="none"/>
      {/* Petit livre */}
      <rect x="18" y="78" width="24" height="18" rx="2" fill="#F59E0B"/>
    </g>

    {/* Mascotte arrière droite */}
    <g transform="translate(310, 90)">
      <ellipse cx="30" cy="70" rx="28" ry="26" fill="#FED7AA" opacity="0.8"/>
      <circle cx="24" cy="62" r="4" fill="#1E293B"/>
      <circle cx="36" cy="62" r="4" fill="#1E293B"/>
      <path d="M26 70 Q30 73 34 70" stroke="#1E293B" strokeWidth="1.5" fill="none"/>
      {/* Tablette */}
      <rect x="16" y="78" width="28" height="20" rx="2" fill="#1E293B"/>
    </g>

    {/* Graphiques flottants */}
    <g transform="translate(420, 180)">
      <rect x="0" y="0" width="60" height="45" rx="8" fill="white" opacity="0.9" stroke="#E2E8F0"/>
      <polyline points="8,35 18,25 28,30 38,15 48,20" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="38" cy="15" r="3" fill="#F59E0B"/>
    </g>

    <g transform="translate(30, 120)">
      <rect x="0" y="0" width="55" height="40" rx="8" fill="white" opacity="0.9" stroke="#E2E8F0"/>
      <rect x="8" y="10" width="20" height="20" rx="4" fill="#3B82F6" opacity="0.3"/>
      <rect x="30" y="18" width="18" height="12" rx="2" fill="#8B5CF6" opacity="0.3"/>
    </g>
  </svg>
);

/* Mascotte Profil Formateur */
const TeacherProfileMascot = () => (
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Fond circulaire */}
    <circle cx="200" cy="200" r="180" fill="#F0F9FF" opacity="0.5"/>
    <circle cx="200" cy="200" r="150" fill="#E0F2FE" opacity="0.3"/>
    
    {/* Mascotte centrale avec béret */}
    <g transform="translate(120, 80)">
      {/* Corps */}
      <ellipse cx="80" cy="180" rx="70" ry="65" fill="url(#profileGrad)"/>
      <defs>
        <radialGradient id="profileGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC"/>
          <stop offset="50%" stopColor="#0EA5E9"/>
          <stop offset="100%" stopColor="#0284C7"/>
        </radialGradient>
      </defs>
      
      {/* Reflet */}
      <ellipse cx="55" cy="140" rx="20" ry="12" fill="white" opacity="0.25" transform="rotate(-15)"/>
      
      {/* Béret */}
      <ellipse cx="80" cy="85" rx="45" ry="15" fill="#1E293B"/>
      <path d="M40 85 Q80 50 120 85" fill="#1E293B"/>
      <rect x="115" y="80" width="10" height="20" fill="#1E293B"/>
      
      {/* Lunettes rondes stylées */}
      <circle cx="65" cy="115" r="18" fill="none" stroke="#1E293B" strokeWidth="3"/>
      <circle cx="95" cy="115" r="18" fill="none" stroke="#1E293B" strokeWidth="3"/>
      <line x1="83" y1="115" x2="77" y2="115" stroke="#1E293B" strokeWidth="2.5"/>
      <line x1="47" y1="112" x2="30" y2="108" stroke="#1E293B" strokeWidth="2"/>
      <line x1="113" y1="112" x2="130" y2="108" stroke="#1E293B" strokeWidth="2"/>
      
      {/* Verres */}
      <circle cx="65" cy="115" r="14" fill="#BAE6FD" opacity="0.4"/>
      <circle cx="95" cy="115" r="14" fill="#BAE6FD" opacity="0.4"/>
      
      {/* Yeux */}
      <circle cx="65" cy="115" r="8" fill="#1E293B"/>
      <circle cx="95" cy="115" r="8" fill="#1E293B"/>
      <circle cx="67" cy="113" r="3" fill="white"/>
      <circle cx="97" cy="113" r="3" fill="white"/>
      
      {/* Sourire confiant */}
      <path d="M65 140 Q80 155 95 140" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round"/>
      
      {/* Joues */}
      <ellipse cx="45" cy="125" rx="12" ry="8" fill="#FDA4AF" opacity="0.35"/>
      <ellipse cx="115" cy="125" rx="12" ry="8" fill="#FDA4AF" opacity="0.35"/>
      
      {/* Moustache fine */}
      <path d="M75 132 Q80 130 85 132" stroke="#1E293B" strokeWidth="1.5" fill="none" opacity="0.5"/>
      
      {/* Tablette avec graphiques */}
      <rect x="45" y="165" width="70" height="50" rx="6" fill="#1E293B"/>
      <rect x="48" y="168" width="64" height="44" rx="4" fill="#0F172A"/>
      {/* Graphiques sur tablette */}
      <rect x="52" y="172" width="25" height="15" rx="2" fill="#3B82F6" opacity="0.6"/>
      <rect x="80" y="172" width="28" height="15" rx="2" fill="#10B981" opacity="0.6"/>
      <rect x="52" y="190" width="56" height="8" rx="2" fill="#F59E0B" opacity="0.4"/>
      <rect x="52" y="200" width="40" height="6" rx="2" fill="#EF4444" opacity="0.4"/>
      
      {/* Main droite pointant */}
      <ellipse cx="140" cy="160" rx="18" ry="12" fill="#0EA5E9" transform="rotate(30)"/>
      <circle cx="152" cy="152" r="6" fill="#7DD3FC"/>
      <circle cx="158" cy="145" r="5" fill="#7DD3FC"/>
    </g>

    {/* Éléments décoratifs */}
    <circle cx="60" cy="100" r="8" fill="#38BDF8" opacity="0.4"/>
    <circle cx="340" cy="80" r="6" fill="#F59E0B" opacity="0.4"/>
    <circle cx="320" cy="320" r="10" fill="#10B981" opacity="0.3"/>
    <circle cx="80" cy="300" r="7" fill="#8B5CF6" opacity="0.3"/>
    
    {/* Badges flottants */}
    <g transform="translate(280, 120)">
      <rect x="0" y="0" width="80" height="30" rx="15" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
      <text x="40" y="20" fontSize="11" fill="#B45309" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">★ 4.9/5</text>
    </g>
    
    <g transform="translate(40, 220)">
      <rect x="0" y="0" width="90" height="30" rx="15" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5"/>
      <text x="45" y="20" fontSize="11" fill="#1E40AF" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">Expert</text>
    </g>
  </svg>
);

/* Mascotte Parcours Intégration */
const IntegrationMascot = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="100" cy="100" r="90" fill="#F0F9FF"/>
    <circle cx="100" cy="100" r="70" fill="#E0F2FE" opacity="0.5"/>
    
    {/* Mascotte miniature */}
    <ellipse cx="100" cy="110" rx="35" ry="32" fill="url(#intGrad)"/>
    <defs>
      <radialGradient id="intGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="50%" stopColor="#0EA5E9"/>
        <stop offset="100%" stopColor="#0284C7"/>
      </radialGradient>
    </defs>
    
    {/* Toque */}
    <polygon points="100,65 125,85 75,85" fill="#1E3A8A"/>
    <rect x="75" y="83" width="50" height="8" rx="2" fill="#1E3A8A"/>
    
    {/* Lunettes */}
    <circle cx="90" cy="95" r="8" fill="none" stroke="#1E293B" strokeWidth="2"/>
    <circle cx="110" cy="95" r="8" fill="none" stroke="#1E293B" strokeWidth="2"/>
    <line x1="98" y1="95" x2="102" y2="95" stroke="#1E293B" strokeWidth="1.5"/>
    <circle cx="90" cy="95" r="4" fill="#1E293B"/>
    <circle cx="110" cy="95" r="4" fill="#1E293B"/>
    
    {/* Sourire */}
    <path d="M92 108 Q100 114 108 108" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round"/>
    
    {/* Diplôme */}
    <rect x="70" y="125" width="25" height="30" rx="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    <line x1="75" y1="132" x2="90" y2="132" stroke="#F59E0B" strokeWidth="1"/>
    <line x1="75" y1="138" x2="90" y2="138" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Graphique */}
    <g transform="translate(115, 125)">
      <rect x="0" y="0" width="30" height="25" rx="3" fill="white" stroke="#E2E8F0"/>
      <polyline points="5,20 12,12 18,16 25,8" fill="none" stroke="#10B981" strokeWidth="2"/>
    </g>
  </svg>
);

const TeacherModal = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=200&fit=crop",
      title: "Gestion simplifiée",
      desc: "Gérez votre calendrier, vos disponibilités et vos revenus depuis un tableau de bord intuitif.",
      color: "from-blue-400 to-indigo-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop",
      title: "Visibilité accrue",
      desc: "Profitez d'une audience qualifiée et d'un référencement optimisé pour développer votre clientèle.",
      color: "from-violet-400 to-purple-400"
    },
    {
      icon: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=200&fit=crop",
      title: "Support dédié",
      desc: "Bénéficiez d'un accompagnement technique et pédagogique pour maximiser l'impact de vos cours.",
      color: "from-emerald-400 to-teal-400"
    }
  ];

  const profileFeatures = [
    {
      icon: "user",
      title: "Présentation",
      desc: "Nos formateurs sont des experts passionnés, alliant une solide expérience terrain à une pédagogie innovante. Chaque profil est soigneusement sélectionné pour sa capacité à transmettre des compétences concrètes et actionnables immédiatement."
    },
    {
      icon: "briefcase",
      title: "Expérience",
      desc: "Plusieurs années d'expérience en entreprise, direction de projets d'envergure, et de nombreuses heures d'enseignement tant en présentiel qu'en ligne."
    },
    {
      icon: "award",
      title: "Compétences clés",
      desc: "Expertise technique pointue, maîtrise des outils de pointe, accompagnement sur des projets réels et capacité d'adaptation aux besoins spécifiques de chaque apprenant."
    },
    {
      icon: "book-open",
      title: "Approche pédagogique",
      desc: "Méthode active basée sur la pratique, sessions interactives, supports de cours modernes et suivi personnalisé pour garantir la réussite de chaque parcours."
    }
  ];

  const steps = [
    {
      phase: "Phase 1 : Inscription et Validation",
      items: [
        { num: 1, title: "Inscription", desc: "Création du compte initial sur la plateforme.", img: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=300&h=200&fit=crop" },
        { num: 2, title: "Confirmation Mail", desc: "Vérification de l'adresse électronique pour sécuriser l'accès.", img: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=300&h=200&fit=crop" },
        { num: 3, title: "Tableau de Bord & Simulation", desc: "Accès à l'interface de gestion et réalisation d'une séance test.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop" }
      ]
    },
    {
      phase: "Phase 2 : Configuration du Profil",
      items: [
        { num: 4, title: "Compléter le Profil", desc: "Matières IT, Finance, Marketing, etc. et tarifs horaires.", img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&h=200&fit=crop" },
        { num: 5, title: "Attente de Confirmation", desc: "Validation du profil par l'équipe administrative Onyono.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" }
      ]
    },
    {
      phase: "Phase 3 : Enseignement et Rémunération",
      items: [
        { num: 6, title: "Séance Gratuite", desc: "Mini-séances d'essai pour convaincre les nouveaux apprenants.", img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop" },
        { num: 7, title: "Référencer l'Apprenant", desc: "Suivi pédagogique et enregistrement des élèves réguliers.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop" },
        { num: 8, title: "Collecte du Solde", desc: "Accumulation des revenus après chaque séance effectuée.", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop" },
        { num: 9, title: "Demande de Virement", desc: "Transfert des fonds vers votre compte bancaire personnel.", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop" }
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sami K.",
      text: "Une pédagogie exceptionnelle. Le formateur a su simplifier des concepts complexes avec des cas pratiques réels.",
      rating: 5
    },
    {
      name: "Ines R.",
      text: "Accompagnement rigoureux et bienveillant. J'ai pu monter en compétence très rapidement sur le Cloud.",
      rating: 5
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
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#00153D] tracking-tight">Pour les Formateurs</h2>
                  <p className="text-sm text-gray-500 font-medium">Partagez votre expertise et monétisez votre savoir</p>
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full">
                    <Sparkles size={16} className="text-violet-500" />
                    <span className="text-sm font-bold text-violet-600 uppercase tracking-wider">Pour les Formateurs</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-[#00153D] leading-tight">
                    Partagez votre expertise et monétisez votre savoir
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Rejoignez une communauté d'experts passionnés. Onyono vous offre les outils nécessaires pour gérer vos sessions, interagir avec vos apprenants et développer votre activité de formation en ligne.
                  </p>
                  <div className="space-y-4 pt-4">
                    {[
                      "Gestion simplifiée de votre calendrier et de vos paiements.",
                      "Visibilité accrue auprès d'une audience qualifiée.",
                      "Support technique et pédagogique dédié."
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button className="bg-[#00153D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors group">
                      Devenir Formateur
                      <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                    <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:border-violet-300 hover:text-violet-600 transition-colors">
                      Découvrir Nos Formateurs
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                </div>
                <div className="relative h-[400px] bg-gradient-to-br from-violet-50 to-purple-50 rounded-[30px] overflow-hidden">
                  <TeacherGroupMascot />
                </div>
              </section>

              {/* Section Profil Formateur */}
              <section className="space-y-8">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Un profil clair pour une relation de confiance.</h3>
                  <p className="text-gray-500 text-lg">Découvrez l'excellence de notre corps professoral et leur engagement pour votre réussite.</p>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  {/* Colonne gauche */}
                  <div className="space-y-6">
                    {profileFeatures.slice(0, 2).map((feature, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-lg shadow-gray-100/30"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {i === 0 ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                          )}
                        </div>
                        <h4 className="text-xl font-black text-[#00153D] mb-2">{feature.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Centre - Mascotte */}
                  <div className="relative h-[350px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-50" />
                    <TeacherProfileMascot />
                  </div>

                  {/* Colonne droite */}
                  <div className="space-y-6">
                    {profileFeatures.slice(2, 4).map((feature, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-lg shadow-gray-100/30"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          i === 0 ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {i === 0 ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                            </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                          )}
                        </div>
                        <h4 className="text-xl font-black text-[#00153D] mb-2">{feature.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section Avis Apprenants */}
              <section className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-[40px] p-8 md:p-12">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-black text-[#00153D] mb-4">Avis apprenants</h3>
                    <p className="text-gray-500 leading-relaxed">Découvrez ce que disent nos apprenants sur l'expertise et l'accompagnement de nos formateurs.</p>
                  </div>
                  {testimonials.map((testimonial, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-[24px] p-6 shadow-lg"
                    >
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, j) => (
                          <Star key={j} size={16} fill="#F59E0B" className="text-amber-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{testimonial.text}"</p>
                      <p className="font-black text-[#00153D] text-sm">{testimonial.name}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Section Parcours d'Intégration */}
              <section className="space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full">
                    <IntegrationMascot />
                    <span className="text-sm font-bold text-violet-600">Parcours d'Intégration du Formateur</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Comment devenir formateur ?</h3>
                  <p className="text-gray-500 text-lg">Un processus simple et structuré en trois phases clés.</p>
                </div>
                
                <div className="space-y-12">
                  {steps.map((phase, phaseIdx) => (
                    <div key={phaseIdx} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
                        <span className="px-6 py-2 bg-violet-50 text-violet-700 font-bold rounded-full text-sm border border-violet-100">
                          {phase.phase}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
                      </div>
                      <div className={`grid gap-6 ${phase.items.length === 3 ? 'md:grid-cols-3' : phase.items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
                        {phase.items.map((step) => (
                          <motion.div
                            key={step.num}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-lg shadow-gray-100/30"
                          >
                            <div className="h-40 bg-gradient-to-br from-violet-50 to-purple-50 relative overflow-hidden">
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

              {/* Section CTA */}
              <section className="text-center py-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-[40px] px-8">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à partager votre expertise ?</h3>
                <p className="text-violet-100 text-lg mb-8 max-w-2xl mx-auto">Rejoignez notre communauté de formateurs et commencez à enseigner dès aujourd'hui.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-violet-600 px-8 py-4 rounded-2xl font-bold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
                    <BookOpen size={20} />
                    Devenir Formateur
                  </button>
                  <button className="bg-violet-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-violet-800 transition-colors flex items-center justify-center gap-2">
                    <Calendar size={20} />
                    Réserver un appel
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

export default TeacherModal;