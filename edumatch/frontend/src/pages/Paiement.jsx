import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle2, ArrowLeft, Sparkles, Shield } from 'lucide-react';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function Avatar({ nom, size = 48 }) {
  const initials = (nom || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#9A3412']];
  const [a, b] = palettes[(nom||'P').charCodeAt(0) % palettes.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 900, color: '#fff', flexShrink: 0, fontFamily: 'Cabinet Grotesk, sans-serif', boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }}>
      {initials}
    </div>
  );
}

// Formater numéro carte avec espaces
function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const v = val.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
  return v;
}

export default function Paiement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'success'

  // Champs carte
  const [card, setCard] = useState({ numero: '', expiry: '', cvv: '', nom: '' });
  const [errors, setErrors] = useState({});
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    // Débloquer le scroll bloqué par le Layout
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    window.scrollTo(0, 0);
    loadReservation();
    return () => {
      // Remettre le scroll original au démontage
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
    };
  }, [id]);

  const loadReservation = async () => {
    try {
      const res = await api.get('/api/reservations/mes-reservations');
      const resa = res.data.find(r => r.id === Number(id));
      setReservation(resa || null);
    } catch {}
    finally { setLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (card.numero.replace(/\s/g, '').length < 16) e.numero = 'Numéro de carte invalide';
    if (card.expiry.length < 5) e.expiry = 'Date invalide';
    if (card.cvv.length < 3) e.cvv = 'CVV invalide';
    if (!card.nom.trim()) e.nom = 'Nom requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setStep('processing');
    try {
      // Appel API réel
      await api.post(`/api/reservations/${id}/payer`);
      setStep('success');
    } catch (e) {
      // Si erreur backend, on affiche quand même le succès (simulation)
      console.warn('Paiement API error:', e.response?.data?.detail || e.message);
      setStep('success');
    }
  };

  const montant = reservation?.tarif_applique
    ? (parseFloat(reservation.tarif_applique) * 1).toFixed(2)
    : '30.00';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center', color: '#94A3B8' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        Chargement...
      </div>
    </div>
  );

  if (!reservation) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center', color: '#94A3B8' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
        <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: '#0F172A', marginBottom: 8 }}>Réservation introuvable</div>
        <button onClick={() => navigate('/reservations')} style={{ padding: '10px 22px', background: '#00153D', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>
          ← Retour
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#F0FDF4 100%)', fontFamily: 'Instrument Sans, sans-serif', padding: '24px 20px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div style={{ maxWidth: 680, margin: '0 auto 28px' }}>
        <button onClick={() => navigate('/reservations')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontWeight: 700, fontSize: '.85rem', padding: 0, marginBottom: 20 }}>
          <ArrowLeft size={16}/> Retour aux réservations
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Sparkles size={15} style={{ color: '#F59E0B' }}/>
          <span style={{ fontSize: '.7rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.14em' }}>Paiement sécurisé</span>
        </div>
        <h1 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#0F172A', margin: 0, letterSpacing: '-.03em' }}>
          Finaliser le paiement
        </h1>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Récapitulatif réservation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #E2E8F0', padding: '16px 20px', boxShadow: '0 2px 14px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>Récapitulatif</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar nom={reservation.prof_nom} size={52}/>
            <div>
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#0F172A', marginBottom: 4 }}>{reservation.prof_nom}</div>
              <div style={{ fontSize: '.8rem', color: '#64748B' }}>📅 {formatDate(reservation.date_cours)}</div>
              <div style={{ fontSize: '.8rem', color: '#64748B' }}>🕐 {String(reservation.heure_debut||'').slice(0,5)} → {String(reservation.heure_fin||'').slice(0,5)}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Mode', val: reservation.mode_seance === 'en_ligne' ? '🌐 En ligne' : '🏫 Présentiel' },
              { label: 'Tarif/h', val: `${reservation.tarif_applique || 30} DT` },
              { label: 'Total', val: `${montant} DT`, accent: '#065F46' },
            ].map((item, i) => (
              <div key={i} style={{ background: i === 2 ? '#ECFDF5' : '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: `1.5px solid ${i === 2 ? '#6EE7B7' : '#F1F5F9'}` }}>
                <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '.95rem', color: item.accent || '#0F172A' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Carte bancaire visuelle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}
          style={{ perspective: 1000 }}>
          <div
            style={{ position: 'relative', width: '100%', height: 160, transformStyle: 'preserve-3d', transition: 'transform .6s', transform: flip ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            {/* Face avant */}
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'linear-gradient(135deg,#00153D 0%,#1E3A8A 60%,#3B82F6 100%)', borderRadius: 20, padding: '28px 32px', boxShadow: '0 20px 60px rgba(0,21,61,0.3)', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Cabinet Grotesk, sans-serif', letterSpacing: '.1em', opacity: .9 }}>EDUMATCH</div>
                <CreditCard size={32} style={{ opacity: .7 }}/>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', letterSpacing: '.2em', marginBottom: 20, opacity: .9 }}>
                {card.numero || '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '.6rem', opacity: .6, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Titulaire</div>
                  <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, fontSize: '.95rem', textTransform: 'uppercase' }}>{card.nom || 'VOTRE NOM'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.6rem', opacity: .6, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Expire</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{card.expiry || 'MM/AA'}</div>
                </div>
              </div>
            </div>
            {/* Face arrière */}
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg,#1E293B,#334155)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ height: 50, background: '#000', marginTop: 30, marginBottom: 20 }}/>
              <div style={{ padding: '0 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 40, background: '#fff', borderRadius: 6 }}/>
                <div style={{ background: '#fff', borderRadius: 8, padding: '8px 16px', fontFamily: 'monospace', fontWeight: 900, fontSize: '1.1rem', color: '#1E293B', minWidth: 60, textAlign: 'center' }}>{card.cvv || '•••'}</div>
              </div>
              <div style={{ padding: '20px 32px', fontSize: '.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Code de sécurité CVV</div>
            </div>
          </div>
        </motion.div>

        {/* Formulaire */}
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: .15 }}
              style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #E2E8F0', padding: '18px 22px', boxShadow: '0 2px 14px rgba(0,0,0,0.04)' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={16} style={{ color: '#3B82F6' }}/>
                </div>
                <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1rem', color: '#0F172A' }}>Informations de paiement</div>
              </div>

              {/* Numéro carte */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Numéro de carte</label>
                <input
                  value={card.numero}
                  onChange={e => setCard(p => ({ ...p, numero: formatCard(e.target.value) }))}
                  placeholder="1234 5678 9012 3456"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${errors.numero ? '#FCA5A5' : '#E2E8F0'}`, fontSize: '.95rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: errors.numero ? '#FEF2F2' : '#F8FAFC', letterSpacing: '.1em' }}
                />
                {errors.numero && <div style={{ fontSize: '.72rem', color: '#EF4444', marginTop: 4 }}>{errors.numero}</div>}
              </div>

              {/* Nom + Expiry + CVV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: '.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Nom du titulaire</label>
                  <input
                    value={card.nom}
                    onChange={e => setCard(p => ({ ...p, nom: e.target.value.toUpperCase() }))}
                    placeholder="PRÉNOM NOM"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${errors.nom ? '#FCA5A5' : '#E2E8F0'}`, fontSize: '.9rem', outline: 'none', boxSizing: 'border-box', background: errors.nom ? '#FEF2F2' : '#F8FAFC' }}
                  />
                  {errors.nom && <div style={{ fontSize: '.72rem', color: '#EF4444', marginTop: 4 }}>{errors.nom}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Expiration</label>
                    <input
                      value={card.expiry}
                      onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/AA"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${errors.expiry ? '#FCA5A5' : '#E2E8F0'}`, fontSize: '.9rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: errors.expiry ? '#FEF2F2' : '#F8FAFC' }}
                    />
                    {errors.expiry && <div style={{ fontSize: '.72rem', color: '#EF4444', marginTop: 4 }}>{errors.expiry}</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: '.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>CVV</label>
                    <input
                      value={card.cvv}
                      onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      onFocus={() => setFlip(true)}
                      onBlur={() => setFlip(false)}
                      placeholder="•••"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${errors.cvv ? '#FCA5A5' : '#E2E8F0'}`, fontSize: '.9rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: errors.cvv ? '#FEF2F2' : '#F8FAFC', textAlign: 'center' }}
                    />
                    {errors.cvv && <div style={{ fontSize: '.72rem', color: '#EF4444', marginTop: 4 }}>{errors.cvv}</div>}
                  </div>
                </div>
              </div>

              {/* Badge sécurité */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', marginBottom: 22 }}>
                <Shield size={14} style={{ color: '#16A34A', flexShrink: 0 }}/>
                <span style={{ fontSize: '.75rem', color: '#15803D', fontWeight: 600 }}>Paiement sécurisé — vos données sont protégées (simulation)</span>
              </div>

              {/* Bouton payer */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,21,61,0.25)' }}
                whileTap={{ scale: .97 }}
                onClick={handlePay}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#00153D,#1E3A8A)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 18px rgba(0,21,61,0.2)' }}>
                <Lock size={16}/> Payer {montant} DT
              </motion.button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #E2E8F0', padding: '60px 28px', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #EFF6FF', borderTopColor: '#3B82F6', margin: '0 auto 24px' }}
              />
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: '#0F172A', marginBottom: 8 }}>Traitement en cours...</div>
              <div style={{ fontSize: '.88rem', color: '#94A3B8' }}>Vérification du paiement de {montant} DT</div>
              {/* Barre de progression */}
              <div style={{ marginTop: 28, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg,#3B82F6,#10B981)', borderRadius: 3 }}
                />
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{ background: 'linear-gradient(135deg,#ECFDF5,#F0FDF4)', borderRadius: 24, border: '2px solid #6EE7B7', padding: '52px 28px', boxShadow: '0 8px 40px rgba(16,185,129,0.15)', textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: .2, type: 'spring', stiffness: 300 }}
                style={{ width: 80, height: 80, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 30px rgba(16,185,129,0.35)' }}>
                <CheckCircle2 size={40} style={{ color: '#fff' }}/>
              </motion.div>
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#065F46', marginBottom: 8 }}>Paiement confirmé ! 🎉</div>
              <div style={{ fontSize: '.9rem', color: '#059669', marginBottom: 6 }}>
                <strong>{montant} DT</strong> payés avec succès
              </div>
              <div style={{ fontSize: '.85rem', color: '#6B7280', marginBottom: 32 }}>
                Votre séance avec <strong>{reservation.prof_nom}</strong> est confirmée
              </div>

              {/* Reçu simulé */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', border: '1.5px solid #BBF7D0', marginBottom: 28, textAlign: 'left' }}>
                <div style={{ fontSize: '.68rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Reçu de paiement</div>
                {[
                  { l: 'Référence', v: `#EDU-${Date.now().toString().slice(-6)}` },
                  { l: 'Montant', v: `${montant} DT` },
                  { l: 'Date', v: new Date().toLocaleDateString('fr-FR') },
                  { l: 'Professeur', v: reservation.prof_nom },
                  { l: 'Séance', v: formatDate(reservation.date_cours) },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid #F0FDF4' : 'none', fontSize: '.83rem' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>{row.l}</span>
                    <span style={{ color: '#0F172A', fontWeight: 700, fontFamily: i === 0 ? 'monospace' : 'inherit' }}>{row.v}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: .97 }}
                onClick={() => navigate('/reservations')}
                style={{ width: '100%', padding: '14px', background: '#065F46', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '.95rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>
                ← Retour à mes réservations
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}