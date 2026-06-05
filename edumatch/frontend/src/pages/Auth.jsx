import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Calendar, ArrowRight, Sparkles,
  GraduationCap, Briefcase, AlertCircle, CheckCircle2,
  ShieldX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/auth';


export default function AuthPage() {
  const [mode, setMode]   = useState('login');
  const [role, setRole]   = useState('étudiant');
  const [form, setForm]   = useState({
    nom: '', prenom: '', email: '', password: '', date_naissance: ''
  });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [compteBloque, setCompteBloque] = useState(false);
  const [raisonBlocage, setRaisonBlocage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login: setUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  /* ── Compte bloqué redirigé depuis l'intercepteur api.js ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('bloque') === '1') {
      const raison = sessionStorage.getItem('compte_bloque_raison') || '';
      setCompteBloque(true);
      setRaisonBlocage(raison);
      setError("Votre compte a été suspendu par l'administration.");
      try { sessionStorage.removeItem('compte_bloque_raison'); } catch {}
    }
  }, [location.search]);

  const IMAGES = {
    mascot:    "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png",
    logo:      "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Graduation%20Cap.png",
    bgPattern: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop"
  };

  const handleChange = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setCompteBloque(false);
    setRaisonBlocage('');

    try {
      let userResponse;
      if (mode === 'login') {
        userResponse = await login(form.email, form.password);
        setUser(userResponse);
        navigate('/');
      } else {
        const payload = { ...form, role, ville: null, niveau: null };
        userResponse = await register(payload);
        /* ── Notification succès inscription ── */
        setSuccessMsg(
          `Votre compte EduMatch a été créé avec succès. Bienvenue sur EduMatch !`
        );
        setUser(userResponse);
        /* Redirection automatique après 2 secondes */
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (detail?.code === 'COMPTE_BLOQUE') {
        setCompteBloque(true);
        setRaisonBlocage(detail.raison || '');
        setError("Votre compte a été suspendu par l'administration.");
      } else if (Array.isArray(detail)) {
        setError(`${detail[0].loc[1]} : ${detail[0].msg}`);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Erreur de connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          COLONNE GAUCHE — VISUELLE
      ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#00153D] overflow-hidden items-center justify-center p-10">
        {/* Fond image */}
        <img
          src={IMAGES.bgPattern}
          className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
          alt=""
        />
        {/* Halos */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo + nom */}
            <div className="flex items-center gap-4 mb-10">
              <img src={IMAGES.logo} alt="Logo EduMatch" className="w-12 h-12 drop-shadow-xl flex-shrink-0" />
              <span className="text-4xl font-black text-white tracking-tighter italic">
                EduMatch
              </span>
            </div>

            {/* ── Titre principal — FIX "Apprentissage garanti." ── */}
            <div className="mb-8">
              <h1 className="font-black text-white tracking-tight leading-tight"
                  style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}>
                Matching intelligent
              </h1>
              <h1 className="font-black text-blue-400 tracking-tight leading-tight"
                  style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}>
                Apprentissage garanti.
              </h1>
            </div>
          </motion.div>

          {/* Cartes features */}
          <div className="space-y-3 mb-8">
            {[
              { title: "Assistant IA 24/7",  desc: "Un chatbot éducatif pour répondre à tous vos besoins." },
              { title: "Experts Certifiés",  desc: "Plus de 500 professeurs vérifiés par nos soins." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
              >
                <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-400 flex-shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base leading-tight">{item.title}</h4>
                  <p className="text-blue-200/60 text-sm italic leading-snug mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mascotte animée */}
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center"
          >
            <img
              src={IMAGES.mascot}
              alt="Robot EduBot"
              className="w-40 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          COLONNE DROITE — FORMULAIRE
      ═══════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-gray-50/30 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[460px] bg-white rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden"
        >
          {/* ── Notification succès inscription ── */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3 px-6 py-4 bg-emerald-50 border-b border-emerald-200"
              >
                <div className="flex-shrink-0 mt-0.5 bg-emerald-100 rounded-full p-1">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-emerald-700 font-black text-sm leading-snug">
                    Compte créé avec succès !
                  </p>
                  <p className="text-emerald-600 text-xs font-medium mt-0.5 leading-relaxed">
                    {successMsg}
                  </p>
                  <p className="text-emerald-400 text-[11px] mt-1">
                    Redirection vers votre tableau de bord…
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-6 sm:p-8">
            {/* ── Header — FIX titres coupés ── */}
            <div className="text-center mb-6">
              <h2
                className="font-black text-[#00153D] tracking-tight italic leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)' }}
              >
                {mode === 'login' ? 'Content de vous revoir' : 'Rejoignez-nous'}
              </h2>
              <p className="text-gray-400 font-medium italic text-sm mt-2">
                Accédez à votre espace EduMatch
              </p>
            </div>

            {/* ── Onglets Connexion / Inscription ── */}
            <div className="flex bg-gray-100 p-1.5 rounded-[22px] mb-6 relative">
              <motion.div
                className="absolute bg-white h-[calc(100%-12px)] rounded-[18px] shadow-md shadow-gray-200/50"
                animate={{ x: mode === 'login' ? 0 : '100%', width: '50%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setCompteBloque(false); }}
                className={`flex-1 py-3 text-sm font-black z-10 transition-colors duration-300 ${mode === 'login' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                CONNEXION
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); setCompteBloque(false); }}
                className={`flex-1 py-3 text-sm font-black z-10 transition-colors duration-300 ${mode === 'register' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                INSCRIPTION
              </button>
            </div>

            {/* ── Formulaire ── */}
            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Champs spécifiques à l'inscription */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Sélection rôle */}
                    <div className="flex gap-3">
                      {['étudiant', 'professeur'].map((r) => (
                        <div
                          key={r}
                          onClick={() => setRole(r)}
                          className={`flex-1 p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${
                            role === r
                              ? 'border-blue-600 bg-blue-50/50'
                              : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                          }`}
                        >
                          {r === 'étudiant'
                            ? <GraduationCap size={20} className={role === r ? 'text-blue-600' : 'text-gray-400'} />
                            : <Briefcase     size={20} className={role === r ? 'text-blue-600' : 'text-gray-400'} />
                          }
                          <span className={`text-[10px] font-black uppercase tracking-widest ${role === r ? 'text-blue-600' : 'text-gray-400'}`}>
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Prénom / Nom */}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={form.prenom}
                        onChange={handleChange('prenom')}
                        required
                        placeholder="Prénom"
                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                      />
                      <input
                        value={form.nom}
                        onChange={handleChange('nom')}
                        required
                        placeholder="Nom"
                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                      />
                    </div>

                    {/* Date de naissance */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        value={form.date_naissance}
                        onChange={handleChange('date_naissance')}
                        required
                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none"
                  size={18}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                  placeholder="Email professionnel"
                  className="w-full pl-13 pr-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                  style={{ paddingLeft: '3.2rem' }}
                />
              </div>

              {/* Mot de passe */}
              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none"
                  size={18}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                  placeholder="Mot de passe"
                  className="w-full pr-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-sm"
                  style={{ paddingLeft: '3.2rem' }}
                />
              </div>

              {/* ── Erreur compte bloqué ── */}
              {compteBloque && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-200 bg-red-50 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-5 py-3 bg-red-100/60 border-b border-red-200">
                    <ShieldX size={17} className="text-red-600 flex-shrink-0" />
                    <span className="text-red-700 font-black text-sm">Compte suspendu</span>
                  </div>
                  <div className="px-5 py-4 space-y-2">
                    <p className="text-red-600 text-xs font-semibold leading-relaxed">
                      Votre compte a été suspendu par l'administration EduMatch.
                    </p>
                    {raisonBlocage && raisonBlocage.trim() !== '' && (
                      <div className="bg-white border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                          Raison communiquée par l'administration :
                        </p>
                        <p className="text-red-700 text-xs font-semibold italic leading-relaxed">
                          {raisonBlocage}
                        </p>
                      </div>
                    )}
                    <p className="text-red-400 text-[11px] font-medium">
                      Contactez l'équipe EduMatch si vous pensez que c'est une erreur.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Erreur standard ── */}
              {error && !compteBloque && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100"
                >
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* ── Bouton submit ── */}
              <button
                type="submit"
                disabled={loading || !!successMsg}
                className="w-full py-4 bg-[#00153D] text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200/50 transition-all active:scale-[0.97] disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center mt-8 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] italic">
              © {new Date().getFullYear()} EduMatch • Excellence Éducative
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}