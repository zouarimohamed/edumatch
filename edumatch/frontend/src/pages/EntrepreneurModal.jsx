import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Sparkles, CheckCircle2, ArrowUpRight, Star, Globe, Target } from 'lucide-react';

/* Mascotte Entrepreneur - Blob en costume avec écrans holographiques */
const EntrepreneurMascot = () => (
  <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Fond salle de contrôle */}
    <rect x="0" y="0" width="500" height="400" rx="20" fill="#0F172A"/>
    
    {/* Écrans holographiques en arrière-plan */}
    <g opacity="0.4">
      <rect x="30" y="30" width="120" height="80" rx="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1"/>
      <rect x="350" y="20" width="130" height="90" rx="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1"/>
      <rect x="20" y="280" width="140" height="100" rx="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1"/>
      <rect x="360" y="270" width="120" height="110" rx="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1"/>
    </g>

    {/* Données sur écrans */}
    <g opacity="0.6">
      {/* Écran gauche */}
      <rect x="45" y="45" width="40" height="6" rx="3" fill="#38BDF8"/>
      <rect x="45" y="55" width="70" height="4" rx="2" fill="#7DD3FC" opacity="0.5"/>
      <rect x="45" y="63" width="55" height="4" rx="2" fill="#38BDF8" opacity="0.4"/>
      <rect x="45" y="75" width="30" height="20" rx="4" fill="#38BDF8" opacity="0.3"/>
      <rect x="80" y="75" width="30" height="20" rx="4" fill="#7DD3FC" opacity="0.3"/>
      
      {/* Écran droit */}
      <rect x="365" y="35" width="50" height="6" rx="3" fill="#38BDF8"/>
      <polyline points="365,55 380,48 395,58 410,42 425,50 440,38" fill="none" stroke="#10B981" strokeWidth="2"/>
      <circle cx="440" cy="38" r="4" fill="#F59E0B"/>
      
      {/* Écran bas gauche */}
      <rect x="35" y="295" width="60" height="6" rx="3" fill="#38BDF8"/>
      <circle cx="60" cy="320" r="20" fill="none" stroke="#38BDF8" strokeWidth="2"/>
      <path d="M60 320 L60 305 A15 15 0 0 1 72 312Z" fill="#38BDF8" opacity="0.5"/>
      
      {/* Écran bas droit */}
      <rect x="375" y="285" width="50" height="6" rx="3" fill="#38BDF8"/>
      <rect x="375" y="298" width="90" height="40" rx="4" fill="#1E293B" stroke="#38BDF8" strokeWidth="1"/>
      <rect x="380" y="303" width="30" height="8" rx="2" fill="#38BDF8" opacity="0.5"/>
      <rect x="380" y="315" width="50" height="6" rx="2" fill="#7DD3FC" opacity="0.4"/>
      <rect x="380" y="325" width="40" height="6" rx="2" fill="#38BDF8" opacity="0.3"/>
    </g>

    {/* Lumières au plafond */}
    <rect x="50" y="5" width="80" height="4" rx="2" fill="#38BDF8" opacity="0.8"/>
    <rect x="200" y="5" width="100" height="4" rx="2" fill="#38BDF8" opacity="0.8"/>
    <rect x="370" y="5" width="80" height="4" rx="2" fill="#38BDF8" opacity="0.8"/>

    {/* Mascotte principale - Leader en costume */}
    <g transform="translate(170, 100)">
      {/* Corps blob avec costume */}
      <ellipse cx="80" cy="130" rx="65" ry="60" fill="url(#entGrad)"/>
      <defs>
        <radialGradient id="entGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC"/>
          <stop offset="50%" stopColor="#0EA5E9"/>
          <stop offset="100%" stopColor="#0284C7"/>
        </radialGradient>
      </defs>
      
      {/* Costume (col) */}
      <path d="M55 95 L80 115 L105 95 L105 85 L80 95 L55 85Z" fill="#1E293B"/>
      <rect x="76" y="95" width="8" height="25" fill="#F8FAFC"/>
      
      {/* Cravate */}
      <polygon points="80,100 85,120 80,130 75,120" fill="#3B82F6"/>
      
      {/* Chapeau haut-de-forme */}
      <rect x="55" y="35" width="50" height="35" rx="3" fill="#1E293B"/>
      <rect x="50" y="65" width="60" height="8" rx="2" fill="#1E293B"/>
      <rect x="75" y="30" width="10" height="10" fill="#F59E0B"/>
      
      {/* Lunettes de CEO */}
      <rect x="55" y="85" width="22" height="16" rx="5" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
      <rect x="83" y="85" width="22" height="16" rx="5" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
      <line x1="77" y1="93" x2="83" y2="93" stroke="#1E293B" strokeWidth="2"/>
      <line x1="55" y1="91" x2="42" y2="88" stroke="#1E293B" strokeWidth="1.5"/>
      <line x1="105" y1="91" x2="118" y2="88" stroke="#1E293B" strokeWidth="1.5"/>
      
      {/* Verres bleus */}
      <rect x="57" y="87" width="18" height="12" rx="4" fill="#BAE6FD" opacity="0.5"/>
      <rect x="85" y="87" width="18" height="12" rx="4" fill="#BAE6FD" opacity="0.5"/>
      
      {/* Yeux perçants */}
      <circle cx="66" cy="93" r="5" fill="#1E293B"/>
      <circle cx="94" cy="93" r="5" fill="#1E293B"/>
      <circle cx="67" cy="91" r="2" fill="white"/>
      <circle cx="95" cy="91" r="2" fill="white"/>
      
      {/* Sourire confiant */}
      <path d="M65 108 Q80 118 95 108" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      
      {/* Joues */}
      <ellipse cx="48" cy="98" rx="10" ry="6" fill="#FDA4AF" opacity="0.3"/>
      <ellipse cx="112" cy="98" rx="10" ry="6" fill="#FDA4AF" opacity="0.3"/>
      
      {/* Tablette avec données */}
      <rect x="50" y="125" width="60" height="40" rx="5" fill="#1E293B"/>
      <rect x="53" y="128" width="54" height="34" rx="3" fill="#0F172A"/>
      {/* Graphiques */}
      <rect x="57" y="132" width="20" height="10" rx="2" fill="#10B981" opacity="0.6"/>
      <rect x="80" y="132" width="22" height="10" rx="2" fill="#3B82F6" opacity="0.6"/>
      <rect x="57" y="145" width="46" height="6" rx="2" fill="#F59E0B" opacity="0.4"/>
      <rect x="57" y="153" width="35" height="5" rx="2" fill="#EF4444" opacity="0.4"/>
      
      {/* Main pointant vers le haut */}
      <ellipse cx="125" cy="115" rx="15" ry="10" fill="#0EA5E9" transform="rotate(-20)"/>
      <circle cx="135" cy="108" r="5" fill="#7DD3FC"/>
      <circle cx="140" cy="102" r="4" fill="#7DD3FC"/>
    </g>

    {/* Mascottes équipe en arrière-plan */}
    <g transform="translate(60, 180)">
      <ellipse cx="30" cy="50" rx="25" ry="22" fill="#38BDF8" opacity="0.6"/>
      <circle cx="24" cy="42" r="3" fill="#1E293B" opacity="0.7"/>
      <circle cx="36" cy="42" r="3" fill="#1E293B" opacity="0.7"/>
      <path d="M26 50 Q30 53 34 50" stroke="#1E293B" strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Petit costume */}
      <rect x="22" y="58" width="16" height="12" rx="2" fill="#1E293B" opacity="0.5"/>
    </g>

    <g transform="translate(380, 170)">
      <ellipse cx="30" cy="50" rx="25" ry="22" fill="#A78BFA" opacity="0.6"/>
      <circle cx="24" cy="42" r="3" fill="#1E293B" opacity="0.7"/>
      <circle cx="36" cy="42" r="3" fill="#1E293B" opacity="0.7"/>
      <path d="M26 50 Q30 53 34 50" stroke="#1E293B" strokeWidth="1.5" fill="none" opacity="0.7"/>
      <rect x="22" y="58" width="16" height="12" rx="2" fill="#1E293B" opacity="0.5"/>
    </g>

    {/* Cercle lumineux au sol */}
    <ellipse cx="250" cy="360" rx="120" ry="15" fill="#38BDF8" opacity="0.2"/>
    <ellipse cx="250" cy="360" rx="80" ry="10" fill="#38BDF8" opacity="0.3"/>
  </svg>
);

/* Mascotte Recrutement */
const RecruitMascot = () => (
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="200" cy="200" r="180" fill="#F0F9FF" opacity="0.5"/>
    <circle cx="200" cy="200" r="140" fill="#E0F2FE" opacity="0.3"/>
    
    {/* Mascotte avec chapeau melon */}
    <g transform="translate(120, 80)">
      <ellipse cx="80" cy="160" rx="60" ry="55" fill="url(#recruitGrad)"/>
      <defs>
        <radialGradient id="recruitGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC"/>
          <stop offset="50%" stopColor="#0EA5E9"/>
          <stop offset="100%" stopColor="#0284C7"/>
        </radialGradient>
      </defs>
      
      {/* Reflet */}
      <ellipse cx="55" cy="130" rx="18" ry="10" fill="white" opacity="0.25" transform="rotate(-15)"/>
      
      {/* Chapeau melon */}
      <ellipse cx="80" cy="75" rx="35" ry="12" fill="#1E293B"/>
      <path d="M50 75 Q80 45 110 75" fill="#1E293B"/>
      <rect x="75" y="55" width="10" height="15" fill="#1E293B"/>
      
      {/* Lunettes style CEO */}
      <rect x="58" y="95" width="20" height="14" rx="5" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
      <rect x="82" y="95" width="20" height="14" rx="5" fill="none" stroke="#1E293B" strokeWidth="2.5"/>
      <line x1="78" y1="102" x2="82" y2="102" stroke="#1E293B" strokeWidth="2"/>
      <circle cx="68" cy="102" r="5" fill="#1E293B"/>
      <circle cx="92" cy="102" r="5" fill="#1E293B"/>
      <circle cx="69" cy="100" r="2" fill="white"/>
      <circle cx="93" cy="100" r="2" fill="white"/>
      
      {/* Sourire confiant */}
      <path d="M65 118 Q80 128 95 118" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      
      {/* Joues */}
      <ellipse cx="48" cy="108" rx="10" ry="6" fill="#FDA4AF" opacity="0.35"/>
      <ellipse cx="112" cy="108" rx="10" ry="6" fill="#FDA4AF" opacity="0.35"/>
      
      {/* Costume */}
      <path d="M60 140 L80 155 L100 140 L100 135 L80 145 L60 135Z" fill="#1E293B"/>
      <rect x="76" y="145" width="8" height="20" fill="#F8FAFC"/>
      
      {/* Tablette avec check */}
      <rect x="50" y="155" width="50" height="35" rx="5" fill="#1E293B"/>
      <rect x="53" y="158" width="44" height="29" rx="3" fill="#0F172A"/>
      <circle cx="75" cy="172" r="8" fill="none" stroke="#10B981" strokeWidth="2"/>
      <path d="M71 172 L74 175 L79 169" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </g>

    {/* Éléments décoratifs */}
    <circle cx="60" cy="100" r="6" fill="#38BDF8" opacity="0.4"/>
    <circle cx="340" cy="80" r="5" fill="#F59E0B" opacity="0.4"/>
    <circle cx="320" cy="320" r="8" fill="#10B981" opacity="0.3"/>
    
    {/* Badges */}
    <g transform="translate(280, 120)">
      <rect x="0" y="0" width="70" height="28" rx="14" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5"/>
      <text x="35" y="18" fontSize="10" fill="#1E40AF" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">Expert</text>
    </g>
  </svg>
);

const EntrepreneurModal = ({ isOpen, onClose }) => {
  const features = [
    {
      title: "Identification rapide",
      desc: "Identifiez rapidement les experts par domaine de compétence grâce à nos filtres avancés.",
      icon: Target
    },
    {
      title: "Prestations ciblées",
      desc: "Prestations ciblées pour un retour sur investissement immédiat et mesurable.",
      icon: Star
    },
    {
      title: "Confiance et sécurité",
      desc: "Confiance et sécurité dans vos échanges professionnels avec vérification des profils.",
      icon: CheckCircle2
    }
  ];

  const steps = [
    {
      num: 1,
      title: "Identification du besoin",
      desc: "Définissez clairement les compétences et l'expertise dont votre projet a besoin.",
      img: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=300&h=200&fit=crop"
    },
    {
      num: 2,
      title: "Recherche d'Experts",
      desc: "Utilisez nos filtres multicritères pour trouver les profils les plus adaptés.",
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&h=200&fit=crop"
    },
    {
      num: 3,
      title: "Consultation des profils",
      desc: "Analysez les expériences, les tarifs et les avis des experts sélectionnés.",
      img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop"
    },
    {
      num: 4,
      title: "Prise de contact",
      desc: "Échangez directement avec l'expert pour définir les modalités de collaboration.",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop"
    },
    {
      num: 5,
      title: "Lancement de la mission",
      desc: "Démarrez votre projet avec un accompagnement structuré et des objectifs clairs.",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
    },
    {
      num: 6,
      title: "Suivi & Collaboration",
      desc: "Suivez l'avancement en temps réel et collaborez efficacement jusqu'à la livraison.",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop"
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#00153D] tracking-tight">Pour les Entrepreneurs</h2>
                  <p className="text-sm text-gray-500 font-medium">Trouvez les compétences clés pour propulser votre business</p>
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
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Pour les Entrepreneurs</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-[#00153D] leading-tight">
                    Trouvez les compétences clés pour propulser votre business
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Ne laissez pas le manque d'expertise technique ou marketing freiner votre croissance. Accédez à un vivier de talents prêts à intervenir sur vos problématiques spécifiques.
                  </p>
                  <div className="space-y-4 pt-4">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <feature.icon size={14} className="text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{feature.desc}</span>
                      </div>
                    ))}
                  </div>
                  <button className="bg-[#00153D] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-colors group mt-4">
                    Recruter Un Expert
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
                <div className="relative h-[400px] bg-gradient-to-br from-slate-900 to-blue-900 rounded-[30px] overflow-hidden">
                  <EntrepreneurMascot />
                </div>
              </section>

              {/* Section Comment recruter */}
              <section className="space-y-12">
                <div className="text-center space-y-4">
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Processus de Recrutement</span>
                  <h3 className="text-3xl md:text-4xl font-black text-[#00153D]">Comment recruter un expert ?</h3>
                  <p className="text-gray-500 text-lg">Un parcours fluide pour transformer vos défis en succès.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-lg shadow-gray-100/30"
                    >
                      <div className="h-40 bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden">
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
              </section>

              {/* Section CTA */}
              <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[40px] px-8">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à booster votre croissance ?</h3>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Accédez immédiatement à notre vivier d'experts et trouvez le talent qui fera la différence.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <Globe size={20} />
                    Voir les experts disponibles
                  </button>
                  <button className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                    <Target size={20} />
                    Décrire mon besoin
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

export default EntrepreneurModal;