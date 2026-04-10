import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Calendar, ArrowRight, Sparkles, 
  GraduationCap, Briefcase, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/auth';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('étudiant');
  const [form, setForm] = useState({ 
    nom: '', prenom: '', email: '', password: '', date_naissance: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: setUser } = useAuth();
  const navigate = useNavigate();

  // --- URLS D'IMAGES ULTRA-STABLES ---
  const IMAGES = {
    // Mascotte Robot Chatbot 3D (Style Microsoft Fluent)
    mascot: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png",
    // Logo 3D
    logo: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Graduation%20Cap.png",
    // Background (Image abstraite tech pro)
    bgPattern: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop"
  };

  const handleChange = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); 
    setError('');
    try {
      let userResponse;
      if (mode === 'login') {
        userResponse = await login(form.email, form.password);
      } else {
        const payload = { ...form, role, ville: null, niveau: null };
        userResponse = await register(payload);
      }
      setUser(userResponse);
      navigate('/');
    } catch (err) {
      const serverError = err.response?.data?.detail;
      setError(Array.isArray(serverError) ? `${serverError[0].loc[1]} : ${serverError[0].msg}` : (serverError || 'Erreur de connexion'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden font-sans">
      
      {/* --- COLONNE GAUCHE : VISUELLE --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#00153D] overflow-hidden items-center justify-center p-12">
        {/* Overlay Image de fond subtile */}
        <img src={IMAGES.bgPattern} className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" alt="" />
        
        {/* Cercles Lumineux (Blobs) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 w-full max-w-lg text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <img src={IMAGES.logo} alt="Logo" className="w-14 h-14 drop-shadow-xl" />
              <span className="text-4xl font-black text-white tracking-tighter italic">EduMatch</span>
            </div>
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Apprenez avec <br />
              <span className="text-blue-400">l'IA Chatbot.</span>
            </h1>
          </motion.div>

          <div className="space-y-6 mb-12">
            {[
              { title: "Assistant IA 24/7", desc: "Un chatbot éducatif pour répondre à toutes vos questions." },
              { title: "Experts Certifiés", desc: "Plus de 500 professeurs vérifiés par nos soins." }
            ].map((item, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl"
              >
                <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-400"><CheckCircle2 size={24}/></div>
                <div className="text-left">
                   <h4 className="text-white font-bold text-lg">{item.title}</h4>
                   <p className="text-blue-200/50 text-sm italic">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            animate={{ y: [0, -25, 0], rotate: [0, 2, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center"
          >
            {/* ICI L'IMAGE DU ROBOT CHATBOT */}
            <img src={IMAGES.mascot} alt="Robot Chatbot AI" className="w-72 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]" />
          </motion.div>
        </div>
      </div>

      {/* --- COLONNE DROITE : FORMULAIRE --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[460px] bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_70px_rgba(0,0,0,0.03)] border border-gray-100"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-[#00153D] tracking-tighter mb-2 italic">
              {mode === 'login' ? 'Content de vous revoir' : 'Rejoignez-nous'}
            </h2>
            <p className="text-gray-400 font-medium italic">Accédez à votre espace EduMatch</p>
          </div>

          {/* Onglets Glissants */}
          <div className="flex bg-gray-100 p-1.5 rounded-[22px] mb-10 relative">
            <motion.div 
              className="absolute bg-white h-[calc(100%-12px)] rounded-[18px] shadow-md shadow-gray-200/50"
              animate={{ x: mode === 'login' ? 0 : '100%', width: '50%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <button onClick={() => setMode('login')} className={`flex-1 py-3 text-sm font-black z-10 transition-colors duration-300 ${mode === 'login' ? 'text-blue-600' : 'text-gray-400'}`}>CONNEXION</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-3 text-sm font-black z-10 transition-colors duration-300 ${mode === 'register' ? 'text-blue-600' : 'text-gray-400'}`}>INSCRIPTION</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex gap-4">
                    {['étudiant', 'professeur'].map((r) => (
                      <div 
                        key={r} onClick={() => setRole(r)}
                        className={`flex-1 p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${role === r ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                      >
                        {r === 'étudiant' ? <GraduationCap size={20} className={role === r ? 'text-blue-600' : 'text-gray-400'}/> : <Briefcase size={20} className={role === r ? 'text-blue-600' : 'text-gray-400'}/>}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${role === r ? 'text-blue-600' : 'text-gray-400'}`}>{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input value={form.prenom} onChange={handleChange('prenom')} required placeholder="Prénom" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm" />
                    <input value={form.nom} onChange={handleChange('nom')} required placeholder="Nom" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Date de naissance</label>
                    <input type="date" value={form.date_naissance} onChange={handleChange('date_naissance')} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input type="email" value={form.email} onChange={handleChange('email')} required placeholder="Email professionnel" className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm" />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input type="password" value={form.password} onChange={handleChange('password')} required placeholder="Mot de passe" className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm" />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100">
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            <button 
              type="submit" disabled={loading}
              className="w-full py-5 bg-[#00153D] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-[0.97] disabled:opacity-70 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <> {mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'} <ArrowRight size={20} /> </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] italic">
            © {new Date().getFullYear()} EduMatch • Excellence Éducative
          </p>
        </motion.div>
      </div>
    </div>
  );
}