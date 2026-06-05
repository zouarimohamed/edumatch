import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfModal from './ProfModal';

/* ─── Helpers ── */
function Stars({ n }) {
  const v = parseFloat(n) || 0;
  return (
    <span style={{ display:'inline-flex', gap:1 }}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} style={{ color:i<=Math.round(v)?'#f59e0b':'var(--border)', fontSize:12 }}>★</span>
      ))}
      <span style={{ fontSize:11, color:'var(--text2)', marginLeft:3 }}>{v.toFixed(1)}</span>
    </span>
  );
}

function ScorePill({ score }) {
  const cfg = score>=85 ? {color:'#16a34a',bg:'rgba(22,163,74,0.1)',border:'rgba(22,163,74,0.25)',label:'Excellent'}
    : score>=70 ? {color:'#6c63ff',bg:'rgba(108,99,255,0.1)',border:'rgba(108,99,255,0.25)',label:'Très bon'}
    : score>=55 ? {color:'#d97706',bg:'rgba(217,119,6,0.1)',border:'rgba(217,119,6,0.25)',label:'Bon'}
    : {color:'#dc2626',bg:'rgba(220,38,38,0.1)',border:'rgba(220,38,38,0.25)',label:'Possible'};
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 9px',borderRadius:20,background:cfg.bg,border:`1px solid ${cfg.border}`,fontSize:11,fontWeight:700,color:cfg.color }}>
      <span style={{ width:6,height:6,borderRadius:'50%',background:cfg.color,display:'inline-block' }}/>
      {score}/100 · {cfg.label}
    </span>
  );
}

/* ─── Carte Prof ── */
function ProfCard({ prof, rank, onView }) {
  const [hov, setHov] = useState(false);
  const nom   = prof.nom || `${prof.user_prenom||''} ${prof.user_nom||''}`.trim();
  const score = prof.score?.total || 0;
  const medals = ['🥇','🥈','🥉'];
  const tarifs = [prof.tarif_en_ligne, prof.tarif_presentiel].filter(v=>v&&parseFloat(v)>0).map(Number);
  const tarifMin = tarifs.length ? Math.min(...tarifs) : null;
  const modeInfo = {
    en_ligne:   {label:'🌐 En ligne',   color:'#0ea5e9'},
    presentiel: {label:'🏫 Présentiel', color:'#16a34a'},
    les_deux:   {label:'🔀 Les deux',   color:'#6c63ff'},
  }[prof.mode_enseignement] || {label:'🏫 Présentiel',color:'#16a34a'};
  const barColor = score>=80?'#16a34a':score>=65?'#6c63ff':score>=50?'#d97706':'#dc2626';

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'var(--card)', border:hov?'1.5px solid #6c63ff':'1.5px solid var(--border)', borderRadius:16, padding:'14px 16px', transition:'all .2s', boxShadow:hov?'0 6px 20px rgba(108,99,255,0.15)':'0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
        <span style={{ fontSize:18,flexShrink:0 }}>{medals[rank-1]||`#${rank}`}</span>
        <div style={{ width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#ff6584)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,overflow:'hidden',flexShrink:0 }}>
          {prof.photo_url ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : '👨‍🏫'}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{nom}</div>
          <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
            <Stars n={prof.note_moyenne}/>
            {prof.ville&&<span style={{ fontSize:11,color:'var(--text2)' }}>📍 {prof.ville}</span>}
          </div>
          {/* Contact rapide */}
          {(prof.email||prof.user_email||prof.telephone)&&(
            <div style={{ display:'flex',gap:5,marginTop:6,flexWrap:'wrap' }}>
              {prof.telephone&&(
                <a href={`tel:${prof.telephone}`}
                  onClick={e=>e.stopPropagation()}
                  style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,background:'#ECFDF5',color:'#065F46',border:'1.5px solid #6EE7B7',textDecoration:'none',flexShrink:0 }}>
                  📞 {prof.telephone}
                </a>
              )}
              {(prof.email||prof.user_email)&&(
                <a href={`mailto:${prof.email||prof.user_email}`}
                  onClick={e=>e.stopPropagation()}
                  title={prof.email||prof.user_email}
                  style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,background:'#EFF6FF',color:'#1D4ED8',border:'1.5px solid #BFDBFE',textDecoration:'none',minWidth:0,overflow:'hidden' }}>
                  ✉️ <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160 }}>{prof.email||prof.user_email}</span>
                </a>
              )}
            </div>
          )}
        </div>
        <div style={{ flexShrink:0,textAlign:'right' }}>
          {tarifMin&&<div style={{ fontWeight:800,fontSize:14,color:'#16a34a' }}>{tarifMin} DT/h</div>}
          <div style={{ fontSize:11,color:modeInfo.color,fontWeight:600 }}>{modeInfo.label}</div>
        </div>
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5 }}>
          <span style={{ fontSize:11,color:'var(--text2)',fontWeight:600 }}>Score de matching</span>
          <div style={{ display:'flex', gap:5, alignItems:'center' }}>
            <ScorePill score={score}/>
          </div>
        </div>
        <div style={{ height:5,background:'var(--surface2)',borderRadius:3,overflow:'hidden' }}>
          <div style={{ height:'100%',width:`${score}%`,background:barColor,borderRadius:3,transition:'width .8s ease' }}/>
        </div>
        <div style={{ display:'flex',gap:5,marginTop:5,flexWrap:'wrap' }}>
          {prof.score?.details && [
            {icon:'📚',key:'matiere',    max:25},
            {icon:'🎓',key:'niveau',     max:40},
            {icon:'📍',key:'ville',      max:15},
            {icon:'💰',key:'budget',     max:10},
            {icon:'📡',key:'mode',       max: 5},
            {icon:'⭐',key:'reputation', max: 5},
          ].map(c=>{
            const val = prof.score.details[c.key]??0;
            const full = val>=c.max;
            const partial = val>0&&!full;
            const color = full?'#16a34a':partial?'#d97706':'#dc2626';
            return (
              <span key={c.key} title={`${c.key}: ${val}/${c.max}`}
                style={{ fontSize:10,color,fontWeight:700,padding:'2px 7px',borderRadius:20,background:full?'rgba(22,163,74,0.09)':partial?'rgba(217,119,6,0.09)':'rgba(220,38,38,0.06)',border:`1px solid ${color}30`,display:'inline-flex',alignItems:'center',gap:3 }}>
                {c.icon}
              </span>
            );
          })}
        </div>
      </div>
      {/* Avertissements */}
      {prof.warnings && prof.warnings.length > 0 && (
        <div style={{ marginBottom:8 }}>
          {prof.warnings.map((w,i) => (
            <div key={i} style={{ fontSize:11,color:'#d97706',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:8,padding:'4px 9px',marginBottom:4,display:'flex',gap:5,alignItems:'center' }}>
              <span>⚠️</span> {w}
            </div>
          ))}
        </div>
      )}
      {prof.bio&&<p style={{ fontSize:12,color:'var(--text2)',lineHeight:1.5,margin:'0 0 10px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{prof.bio}</p>}
      {/* ── Message jaune si pas de séance correspondant au besoin ── */}
      {(prof.description_score === 0 || prof.description_score === undefined) && (
        <div style={{
          marginBottom:10, padding:'8px 12px',
          background:'rgba(245,158,11,0.09)',
          border:'1px solid rgba(245,158,11,0.3)',
          borderRadius:10,
          display:'flex', gap:8, alignItems:'flex-start'
        }}>
          <span style={{ fontSize:15, flexShrink:0 }}>💡</span>
          <span style={{ fontSize:11, color:'#92400e', lineHeight:1.55 }}>
            {(() => {
                const matiere = prof?.tarifs_matieres?.[0]?.nom_matiere || null;
                return matiere
                  ? `Ce formateur enseigne ${matiere} au niveau demandé. Contactez-le pour convenir d'une séance adaptée à votre besoin.`
                  : "Ce formateur correspond à votre profil. Contactez-le pour convenir d'une séance adaptée à votre besoin.";
              })()}
          </span>
        </div>
      )}

      {/* Créneaux disponibles */}
      {prof.disponibilites && prof.disponibilites.length > 0 ? (
        <div style={{ marginBottom:10 }}>
          {prof.disponibilites.slice(0,2).map((d,i) => {
            const matchScore = d.description_match_score || 0;
            const isMyNeed   = matchScore >= 4 && i === 0; // 1er créneau seulement
            return (
              <div key={i} style={{
                marginBottom: 7,
                borderRadius: 11,
                overflow: 'hidden',
                border: isMyNeed
                  ? '2px solid #6c63ff'
                  : '1px solid rgba(22,163,74,0.25)',
                boxShadow: isMyNeed
                  ? '0 4px 16px rgba(108,99,255,0.18)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
              }}>

                {/* ── En-tête créneau ── */}
                <div style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'7px 11px',
                  background: isMyNeed
                    ? 'linear-gradient(90deg,#6c63ff,#8b5cf6)'
                    : 'rgba(22,163,74,0.07)',
                  fontSize:11,
                  color: isMyNeed ? '#fff' : 'var(--text)',
                }}>
                  <span>{d.hors_date ? '⚠️' : '📅'}</span>
                  <span style={{ fontWeight:700 }}>
                    {new Date(d.date).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}
                  </span>
                  <span style={{ opacity: isMyNeed ? 0.85 : 1, color: isMyNeed ? '#e0deff' : 'var(--text2)' }}>
                    {d.heure_debut}–{d.heure_fin}
                  </span>
                  {isMyNeed && (
                    <span style={{
                      marginLeft:'auto', fontSize:9, fontWeight:800,
                      background:'rgba(255,255,255,0.22)', borderRadius:20,
                      padding:'2px 8px', letterSpacing:'.05em', textTransform:'uppercase',
                    }}>
                      ✓ Votre besoin
                    </span>
                  )}
                  {!isMyNeed && (
                    <>
                      <span style={{ marginLeft:'auto', fontSize:10, color:'#16a34a', fontWeight:600 }}>
                        {d.mode==='en_ligne'?'🌐':'🏫'}
                      </span>
                      {d.nb_places > 0 && (
                        <span style={{ fontSize:10, color:'#16a34a', fontWeight:600 }}>
                          {d.nb_places} place{d.nb_places>1?'s':''}
                        </span>
                      )}
                    </>
                  )}
                  {isMyNeed && (
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.8)', fontWeight:600, marginLeft:4 }}>
                      {d.mode==='en_ligne'?'🌐':'🏫'} {d.nb_places>0?`${d.nb_places} place${d.nb_places>1?'s':''}`:'' }
                    </span>
                  )}
                </div>

                {/* ── Description séance ── */}
                {d.description && (
                  <div style={{
                    padding: '8px 12px 10px',
                    background: isMyNeed
                      ? 'linear-gradient(135deg,rgba(108,99,255,0.07),rgba(108,99,255,0.02))'
                      : 'var(--surface2)',
                    borderTop: isMyNeed
                      ? '1px solid rgba(108,99,255,0.15)'
                      : '1px solid var(--border)',
                  }}>
                    <div style={{
                      fontSize: isMyNeed ? 11.5 : 10.5,
                      color: isMyNeed ? 'var(--text)' : 'var(--text2)',
                      lineHeight: 1.6,
                      fontWeight: isMyNeed ? 500 : 400,
                      display:'-webkit-box', WebkitLineClamp: isMyNeed ? 4 : 2,
                      WebkitBoxOrient:'vertical', overflow:'hidden',
                    }}>
                      {d.description}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize:11,color:'var(--text3)',padding:'5px 9px',background:'var(--surface2)',borderRadius:8,marginBottom:10,textAlign:'center' }}>
          📅 Aucun créneau — contacter directement
        </div>
      )}
      {/* Ligne contact bas de carte */}
      {(prof.email||prof.user_email||prof.telephone)&&(
        <div style={{ display:'flex',gap:6,marginBottom:8,padding:'8px 10px',background:'var(--surface2)',borderRadius:9,border:'1px solid var(--border)' }}>
          <span style={{ fontSize:10,color:'var(--text2)',fontWeight:600,alignSelf:'center',marginRight:2,flexShrink:0 }}>📬</span>
          {prof.telephone&&(
            <a href={`tel:${prof.telephone}`}
              onClick={e=>e.stopPropagation()}
              style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'#ECFDF5',color:'#065F46',border:'1px solid #6EE7B7',textDecoration:'none',flexShrink:0 }}>
              📞 {prof.telephone}
            </a>
          )}
          {(prof.email||prof.user_email)&&(
            <a href={`mailto:${prof.email||prof.user_email}`}
              onClick={e=>e.stopPropagation()}
              title={prof.email||prof.user_email}
              style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'#EFF6FF',color:'#1D4ED8',border:'1px solid #BFDBFE',textDecoration:'none',flex:1,minWidth:0 }}>
              ✉️ <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{prof.email||prof.user_email}</span>
            </a>
          )}
        </div>
      )}
      <div style={{ display:'flex',gap:8 }}>
        <button onClick={()=>onView(prof)} style={{ flex:1,padding:'8px 0',background:'var(--surface2)',border:'1.5px solid var(--border)',borderRadius:9,fontSize:12,fontWeight:600,cursor:'pointer',color:'var(--text)',transition:'all .15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.color='#6c63ff';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text)';}}>
          👤 Voir profil
        </button>
        <button onClick={()=>onView(prof)} style={{ flex:2,padding:'8px 0',background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',border:'none',borderRadius:9,fontSize:12,fontWeight:700,cursor:'pointer',color:'#fff',boxShadow:'0 2px 8px rgba(108,99,255,0.3)',transition:'all .2s' }}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
          onMouseLeave={e=>e.currentTarget.style.transform='none'}>
          📅 Réserver un cours
        </button>
      </div>
    </div>
  );
}

/* ─── Bulle message ── */
function Message({ msg, onViewProf }) {
  const isUser = msg.role==='user';
  const hasProfs = !isUser && msg.profs && msg.profs.length > 0;

  // Rendu markdown simple : **gras**
  const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line === '') return <div key={i} style={{ height: '0.5em' }} />;
      const parts = line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j} style={{ fontWeight:600, color:'var(--color-text-primary)' }}>{part.slice(2,-2)}</strong>
          : part
      );
      return <div key={i} style={{ lineHeight: 1.7 }}>{parts}</div>;
    });
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:isUser?'flex-end':'flex-start',marginBottom:20,gap:8 }}>
      {/* Bulle message — masquée si profs présents */}
      {!hasProfs && (
        <div style={{ display:'flex',alignItems:'flex-end',gap:8,maxWidth:'80%',flexDirection:isUser?'row-reverse':'row' }}>
          <div style={{ width:32,height:32,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,background:isUser?'linear-gradient(135deg,#6c63ff,#8b5cf6)':'linear-gradient(135deg,#f59e0b,#ef4444)',boxShadow:'0 2px 6px rgba(0,0,0,0.15)' }}>
            {isUser?'👤':'🤖'}
          </div>
          <div>
            <div style={{ padding: isUser ? '11px 15px' : '14px 18px',borderRadius:isUser?'18px 18px 4px 18px':'18px 18px 18px 4px',background:isUser?'linear-gradient(135deg,#6c63ff,#8b5cf6)':'var(--surface)',color:isUser?'#fff':'var(--text)',fontSize:14,lineHeight:1.65,border:isUser?'none':'1px solid var(--border)',boxShadow:isUser?'0 2px 8px rgba(108,99,255,0.25)':'0 1px 4px rgba(0,0,0,0.06)',wordBreak:'break-word' }}>
              {renderContent(msg.content)}
            </div>
            <div style={{ fontSize:11,color:'var(--text2)',marginTop:3,textAlign:isUser?'right':'left' }}>{msg.time}</div>
          </div>
        </div>
      )}

      {/* Barre de progression — masquée pour la démo */}
      {false && !isUser && msg.prochain_critere && !hasProfs && msg.criteres && Object.values(msg.criteres).some(v => v !== null && v !== undefined) && (
        <div style={{ paddingLeft:40, maxWidth:460 }}>
          <ProgressBar prochain={msg.prochain_critere} criteres={msg.criteres || {}} />
        </div>
      )}

      {/* Résultats profs */}
      {hasProfs && (
        <div style={{ width:'100%',maxWidth:540,display:'flex',flexDirection:'column',gap:10 }}>
          {/* Résumé intelligent au-dessus des cartes */}
          <div style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,background:'linear-gradient(135deg,#f59e0b,#ef4444)',boxShadow:'0 2px 6px rgba(0,0,0,0.15)' }}>
              🤖
            </div>
            <div style={{ flex:1 }}>
              <div style={{ padding:'11px 15px',borderRadius:'18px 18px 18px 4px',background:'var(--surface)',color:'var(--text)',fontSize:14,lineHeight:1.65,border:'1px solid var(--border)',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',whiteSpace:'pre-wrap',wordBreak:'break-word' }}>
                {msg.alternative ? (
                  <span style={{ color:'#d97706' }}>
                    💡 Aucun prof en <strong>{msg.alternative.matiere_originale}</strong> — alternatives en <strong>{msg.alternative.matiere_alternative}</strong>
                  </span>
                ) : <div style={{ fontSize:14 }}>{renderContent(msg.content)}</div>}
              </div>
              <div style={{ fontSize:11,color:'var(--text2)',marginTop:3 }}>{msg.time}</div>
            </div>
          </div>
          {/* Cartes profs */}
          <div style={{ paddingLeft:42,display:'flex',flexDirection:'column',gap:10 }}>
            {msg.profs.map((prof,i)=><ProfCard key={prof.id} prof={prof} rank={i+1} onView={onViewProf}/>)}
          </div>
        </div>
      )}

      {!isUser && msg.noProfs && msg.besoin_complet && !hasProfs && (
        <div style={{ paddingLeft:40,maxWidth:420 }}>
          <div style={{ padding:'10px 14px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:12,fontSize:13,color:'var(--text)',display:'flex',gap:8,alignItems:'flex-start' }}>
            <span style={{ fontSize:16 }}>💡</span>
            <span>Aucun professeur trouvé. Essayez un autre budget, mode ou ville.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display:'flex',alignItems:'flex-end',gap:8,marginBottom:16 }}>
      <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
      <div style={{ padding:'12px 16px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'18px 18px 18px 4px',display:'flex',gap:5,alignItems:'center' }}>
        <style>{`@keyframes db{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}} .db{width:7px;height:7px;border-radius:50%;background:#6c63ff;animation:db 1.2s infinite;}`}</style>
        <div className="db" style={{ animationDelay:'0s' }}/><div className="db" style={{ animationDelay:'.15s' }}/><div className="db" style={{ animationDelay:'.3s' }}/>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Je cherche un prof de maths pour le bac",
  "Prof de physique en ligne, budget 40 DT/h",
  "Cours d'anglais pour collège à Tunis",
  "Professeur d'informatique / programmation",
  "Dev web React pour débutant, soir disponible",
  "Arabe 4ème primaire à Sfax, présentiel",
];

// Questions du mode guidé — liste ordonnée
const GUIDED_STEPS = [
  {
    key:         'domaine',
    question:    'Quelle type de formation cherchez-vous ?',
    icon:        '🏫',
    type:        'choice',
    choices:     [
      { label: '🎓 Soutien académique', value: 'Je cherche un soutien académique (scolaire)', sub: 'Primaire, collège, lycée, bac, université' },
      { label: '💼 Formation professionnelle', value: 'Je cherche une formation professionnelle', sub: 'Dev web, IA, cloud, reconversion...' },
    ],
  },
  {
    key:         'matiere',
    question:    'Quelle matière ou technologie ?',
    icon:        '📚',
    type:        'text',
    placeholder: 'Ex: maths, physique, développement web, React...',
  },
  {
    key:         'niveau',
    question:    "Quel est le niveau de l'élève ?",
    icon:        '🎓',
    type:        'choice',
    choices:     [
      { label: '📗 Primaire', value: 'primaire', sub: '1ère à 6ème année' },
      { label: '📘 Collège', value: 'collège', sub: '7ème, 8ème, 9ème année' },
      { label: '📙 Lycée / Bac', value: 'lycée', sub: '1ère, 2ème, 3ème, Bac' },
      { label: '🎓 Université', value: 'université', sub: 'Licence, Master...' },
      { label: '💼 Professionnel', value: 'débutant à avancé', sub: 'Tous niveaux' },
    ],
  },
  {
    key:         'mode',
    question:    "Mode d'enseignement souhaité ?",
    icon:        '📡',
    type:        'choice',
    choices:     [
      { label: '🌐 En ligne', value: 'en ligne', sub: 'Zoom, Google Meet...' },
      { label: '🏫 Présentiel', value: 'en présentiel', sub: 'À domicile ou chez le prof' },
      { label: '🔀 Les deux', value: 'en ligne ou en présentiel', sub: 'Je suis flexible' },
    ],
  },
  {
    key:         'budget',
    question:    'Quel est votre budget maximum par heure ?',
    icon:        '💰',
    type:        'choice',
    choices:     [
      { label: '≤ 30 DT/h', value: 'budget maximum 30 DT par heure' },
      { label: '≤ 50 DT/h', value: 'budget maximum 50 DT par heure' },
      { label: '≤ 80 DT/h', value: 'budget maximum 80 DT par heure' },
      { label: 'Peu importe', value: 'peu importe le budget' },
    ],
  },
  {
    key:         'creneaux',
    question:    'Avez-vous une préférence de créneau ?',
    icon:        '📅',
    type:        'choice',
    choices:     [
      { label: '🌅 Matin', value: 'le matin', sub: '8h – 12h' },
      { label: '☀️ Après-midi', value: "l'après-midi", sub: '12h – 18h' },
      { label: '🌙 Soir', value: 'le soir', sub: 'Après 18h' },
      { label: '🗓 Week-end', value: 'le week-end', sub: 'Samedi ou dimanche' },
      { label: '🔄 Flexible', value: 'peu importe les créneaux' },
    ],
  },
];

// Étapes dynamiques selon domaine — calculées depuis criteres
function getEtapes(criteres) {
  const domaine = criteres?.domaine_type;
  if (!domaine) return [
    { key:'domaine_type', label:'Domaine', icon:'🏫' },
  ];
  if (domaine === 'academique') {
    const etapes = [
      { key:'domaine_type', label:'Domaine',     icon:'🏫' },
      { key:'matiere',      label:'Matière',     icon:'📚' },
      { key:'niveau',       label:'Niveau',      icon:'🎓' },
    ];
    // Ajouter sous_niveau seulement si niveau est défini
    if (criteres?.niveau) {
      etapes.push({ key:'sous_niveau', label:'Sous-niveau', icon:'📋' });
    }
    etapes.push(
      { key:'mode',         label:'Mode',        icon:'📡' },
    );
    if (criteres?.mode === 'presentiel') {
      etapes.push({ key:'ville', label:'Ville', icon:'📍' });
    }
    etapes.push({ key:'budget_max', label:'Budget',   icon:'💰' });
    etapes.push({ key:'creneaux',   label:'Créneaux',  icon:'📅' });
    return etapes;
  }
  return [
    { key:'domaine_type', label:'Domaine',    icon:'💼' },
    { key:'matiere',      label:'Spécialité', icon:'🛠' },
    { key:'mode',         label:'Mode',       icon:'📡' },
    { key:'budget_max',   label:'Budget',     icon:'💰' },
    { key:'creneaux',     label:'Créneaux',   icon:'📅' },
  ];
}

function ProgressBar({ prochain, criteres }) {
  const ETAPES = getEtapes(criteres);
  // creneaux=False = "peu importe" = réponse valide → compte comme fait
  const done = ETAPES.filter(e => {
    if (!criteres) return false;
    const v = criteres[e.key];
    return v !== null && v !== undefined; // false (peu importe) compte aussi
  }).length;
  const idx  = ETAPES.findIndex(e => e.key === prochain);
  return (
    <div style={{ padding:'10px 14px',background:'rgba(108,99,255,0.06)',border:'1px solid rgba(108,99,255,0.15)',borderRadius:12,marginTop:4 }}>
      <div style={{ fontSize:11,color:'var(--text2)',fontWeight:600,marginBottom:8 }}>
        Collecte du profil — {done}/{ETAPES.length} critères
      </div>
      <div style={{ display:'flex',gap:5,alignItems:'center' }}>
        {ETAPES.map((e,i) => {
          const isDone    = i < done;
          const isCurrent = i === done;
          return (
            <React.Fragment key={e.key}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                <div style={{ width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,
                  background:isDone?'#6c63ff':isCurrent?'rgba(108,99,255,0.15)':'var(--surface2)',
                  border:isDone?'2px solid #6c63ff':isCurrent?'2px solid #6c63ff':'2px solid var(--border)',
                  color:isDone?'#fff':isCurrent?'#6c63ff':'var(--text2)',fontWeight:700 }}>
                  {isDone ? '✓' : e.icon}
                </div>
                <div style={{ fontSize:9,color:isDone||isCurrent?'#6c63ff':'var(--text3)',fontWeight:isCurrent?700:400 }}>{e.label}</div>
              </div>
              {i < ETAPES.length-1 && (
                <div style={{ flex:1,height:2,background:i<done?'#6c63ff':'var(--border)',borderRadius:1,marginBottom:14 }}/>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════
   COMPOSANT MODE GUIDÉ
════════════════════════════════════════════════ */
function GuidedMode({ onSend, onExit }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textVal, setTextVal] = useState('');
  const step = GUIDED_STEPS[stepIdx];
  const isLast = stepIdx === GUIDED_STEPS.length - 1;

  const handleChoice = (value) => {
    const newAnswers = { ...answers, [step.key]: value };
    setAnswers(newAnswers);
    if (isLast) {
      // Construire le message synthèse et envoyer
      const parts = Object.values(newAnswers).filter(Boolean);
      const msg = parts.join(', ');
      onSend(msg);
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const handleText = () => {
    if (!textVal.trim()) return;
    const newAnswers = { ...answers, [step.key]: textVal.trim() };
    setAnswers(newAnswers);
    setTextVal('');
    if (isLast) {
      const parts = Object.values(newAnswers).filter(Boolean);
      onSend(parts.join(', '));
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const pct = Math.round((stepIdx / GUIDED_STEPS.length) * 100);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'24px 28px', overflowY:'auto' }}>
      {/* Header mode guidé */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:'var(--text)', marginBottom:3 }}>
            🧭 Mode guidé — Étape {stepIdx + 1}/{GUIDED_STEPS.length}
          </div>
          <div style={{ fontSize:12, color:'var(--text2)' }}>Répondez étape par étape pour affiner votre recherche</div>
        </div>
        <button onClick={onExit}
          style={{ padding:'6px 14px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:9, cursor:'pointer', fontSize:12, color:'var(--text2)', fontWeight:600 }}>
          ✕ Quitter le guide
        </button>
      </div>

      {/* Barre de progression */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text2)', marginBottom:6 }}>
          <span>Progression</span>
          <span style={{ fontWeight:700, color:'#6c63ff' }}>{pct}%</span>
        </div>
        <div style={{ height:5, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#6c63ff,#8b5cf6)', borderRadius:3, transition:'width .4s ease' }}/>
        </div>
        {/* Étapes visuelles */}
        <div style={{ display:'flex', gap:4, marginTop:10 }}>
          {GUIDED_STEPS.map((s, i) => (
            <div key={s.key} title={s.question}
              style={{ flex:1, height:4, borderRadius:2,
                background: i < stepIdx ? '#6c63ff' : i === stepIdx ? '#8b5cf6' : 'var(--border)',
                transition:'background .3s' }}
            />
          ))}
        </div>
      </div>

      {/* Récap des réponses précédentes */}
      {Object.keys(answers).length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
          {Object.entries(answers).map(([k, v]) => {
            const s = GUIDED_STEPS.find(st => st.key === k);
            return (
              <div key={k} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:20,
                background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.25)', fontSize:12, color:'#6c63ff', fontWeight:600 }}>
                {s?.icon} <span style={{ maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.length > 30 ? v.slice(0,30)+'…' : v}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Question courante */}
      <div style={{ background:'var(--surface)', border:'1.5px solid rgba(108,99,255,0.2)', borderRadius:18, padding:'22px 24px', marginBottom:20, boxShadow:'0 4px 20px rgba(108,99,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
            {step.icon}
          </div>
          <div style={{ fontWeight:700, fontSize:15, color:'var(--text)', lineHeight:1.4 }}>{step.question}</div>
        </div>

        {/* Choix ou champ texte */}
        {step.type === 'choice' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {step.choices.map(ch => (
              <button key={ch.value} onClick={() => handleChoice(ch.value)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 15px',
                  background:'var(--surface2)', border:'1.5px solid var(--border)', borderRadius:13,
                  cursor:'pointer', textAlign:'left', transition:'all .15s', width:'100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#6c63ff'; e.currentTarget.style.background='rgba(108,99,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface2)'; }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'var(--text)' }}>{ch.label}</div>
                  {ch.sub && <div style={{ fontSize:11, color:'var(--text2)', marginTop:2 }}>{ch.sub}</div>}
                </div>
                <span style={{ fontSize:16, color:'var(--text3)' }}>›</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display:'flex', gap:10 }}>
            <input
              autoFocus
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleText(); }}
              placeholder={step.placeholder || 'Votre réponse...'}
              style={{ flex:1, padding:'11px 15px', background:'var(--surface2)', border:'1.5px solid var(--border)',
                borderRadius:12, fontSize:14, color:'var(--text)', outline:'none', fontFamily:'inherit',
                transition:'border-color .15s' }}
              onFocus={e => e.target.style.borderColor='#6c63ff'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            <button onClick={handleText} disabled={!textVal.trim()}
              style={{ padding:'11px 18px', background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',
                border:'none', borderRadius:12, cursor:textVal.trim()?'pointer':'not-allowed',
                color:'#fff', fontWeight:700, fontSize:13, flexShrink:0,
                opacity:textVal.trim()?1:0.5, transition:'all .15s' }}>
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {stepIdx > 0 && (
        <div style={{ textAlign:'center' }}>
          <button onClick={() => setStepIdx(i => i - 1)}
            style={{ padding:'7px 18px', background:'none', border:'1px solid var(--border)',
              borderRadius:9, cursor:'pointer', fontSize:12, color:'var(--text2)', fontWeight:600 }}>
            ← Étape précédente
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════ */
export default function Chatbot() {
  const { user } = useAuth();

  // ── Mode conversationnel ou guidé ──
  const [chatMode, setChatMode] = useState('libre'); // 'libre' | 'guide'

  // ── États sessions ──
  const [sessions, setSessions]         = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [editingId, setEditingId]       = useState(null);
  const [editTitle, setEditTitle]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── États chat ──
  const [msgs, setMsgs]               = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [welcome, setWelcome]         = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const taRef     = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs,loading]);

  // ── Charger les sessions ──
  // Afficher le message d'accueil dès l'ouverture si pas de session
  useEffect(() => {
    if (welcome && msgs.length === 0) {
      setMsgs([{
        role: 'assistant',
        content: "Bonjour ! 👋\n\nJe suis **EduBot**, votre assistant de matching pour trouver le professeur ou le formateur idéal.\n\nNous proposons un **soutien académique** pour les étudiants et les universitaires, ainsi que des **formations professionnelles** pour les professionnels en reconversion ou souhaitant développer leurs compétences en entreprise.\n\n**Comment puis-je vous aider ?** 😊\n\nDécrivez librement votre besoin.",
        time: new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
        profs: [],
        prochain_critere: null,
        criteres: {},
        _isWelcome: true,
      }]);
    }
  }, []);

  useEffect(()=>{
    loadSessions();
  },[]);

  const loadSessions = async () => {
    try {
      const r = await api.get('/api/chatbot/sessions');
      setSessions(r.data || []);
    } catch {}
    finally { setLoadingSessions(false); }
  };

  // ── Créer une nouvelle session ──
  const WELCOME_BOT_MSG = {
    role: 'assistant',
    content: "Bonjour ! 👋\n\nJe suis **EduBot**, votre assistant de matching pour trouver le professeur ou le formateur idéal.\n\nNous proposons un **soutien académique** pour les étudiants et les universitaires, ainsi que des **formations professionnelles** pour les professionnels en reconversion ou souhaitant développer leurs compétences en entreprise.\n\n**Comment puis-je vous aider ?** 😊\n\nDécrivez librement votre besoin.",
    time: new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
    profs: [],
    prochain_critere: null,
    criteres: {},
  };

  const newSession = async () => {
    try {
      const r = await api.post('/api/chatbot/sessions', { titre: 'Nouvelle conversation' });
      const s = r.data;
      setSessions(prev => [s, ...prev]);
      setActiveSession(s);
      setMsgs([WELCOME_BOT_MSG]);
      setWelcome(false);
      setInput('');
    } catch { alert('Erreur création session'); }
  };

  // ── Charger une session ──
  const openSession = async (session) => {
    setActiveSession(session);
    setWelcome(false);
    try {
      const r = await api.get(`/api/chatbot/sessions/${session.id}/messages`);
      const messages = (r.data || []).map(m => ({
        role:             m.role,
        content:          m.content,
        time:             new Date(m.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
        profs:            m.profs || [],
        alternative:      m.alternative || null,
        noProfs:          m.noProfs || false,
        besoin_complet:   m.besoin_complet || false,
        criteres:         m.criteres || {},
        prochain_critere: m.prochain_critere || null,
      }));
      setMsgs(messages);
    } catch { setMsgs([]); }
  };

  // ── Supprimer une session ──
  const deleteSession = async (id) => {
    try {
      await api.delete(`/api/chatbot/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMsgs([]);
        setWelcome(true);
      }
    } catch { alert('Erreur suppression'); }
    setConfirmDelete(null);
  };

  // ── Renommer une session ──
  const renameSession = async (id, titre) => {
    try {
      await api.put(`/api/chatbot/sessions/${id}`, { titre });
      setSessions(prev => prev.map(s => s.id === id ? {...s, titre} : s));
      if (activeSession?.id === id) setActiveSession(prev => ({...prev, titre}));
    } catch {}
    setEditingId(null);
  };

  const now = () => new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});

  const handleView = async (prof) => {
    // Les critères sont stockés directement dans prof._criteres
    // (enrichissement fait lors de la réception des résultats)
    const criteres = prof._criteres || null;
    const sous_niveau = criteres?.sous_niveau || null;
    const mode        = criteres?.mode        || null;

    const params = new URLSearchParams();
    if (sous_niveau) params.append('sous_niveau', sous_niveau);
    if (mode)        params.append('mode', mode);
    const qs = params.toString() ? `?${params.toString()}` : '';

    try {
      const r = await api.get(`/api/chatbot/prof-detail/${prof.id}${qs}`);
      // Garder les critères dans le profil pour ProfModal aussi
      setSelectedProf({ ...r.data, _criteres: criteres });
    } catch {
      setSelectedProf(prof);
    }
  };

  // ── Envoyer un message ──
  const send = useCallback(async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;

    setInput('');
    setWelcome(false);
    if (taRef.current) taRef.current.style.height = 'auto';

    // Créer session si pas active
    let sessionId = activeSession?.id;
    if (!sessionId) {
      try {
        const r = await api.post('/api/chatbot/sessions', { titre: txt.slice(0,50) });
        const s = r.data;
        setSessions(prev => [s, ...prev]);
        setActiveSession(s);
        sessionId = s.id;
      } catch {}
    }

    const userMsg = { role:'user', content:txt, time:now(), profs:[] };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    // Sauvegarder message user en base
    if (sessionId) {
      try { await api.post(`/api/chatbot/sessions/${sessionId}/messages`, { role:'user', content:txt }); } catch {}
    }

    // Exclure le message d'accueil local (premier msg bot sans interaction user)
    const history = [...msgs, userMsg]
      .filter(m => !(m.role === 'assistant' && m._isWelcome))
      .map(m=>({role:m.role,content:m.content}));

    try {
      const res = await api.post('/api/chatbot/chat', { messages: history });
      const { reply, top3_profs, besoin_complet, prochain_critere } = res.data;
      const hasProfs = top3_profs && top3_profs.length > 0;

      // Enrichir chaque prof avec les critères pour le filtrage "Voir profil"
      const criteres_msg = res.data.criteres || null;
      const profs_enrichis = (hasProfs ? top3_profs : []).map(p => ({
        ...p,
        _criteres: criteres_msg,  // stocker les critères directement dans le prof
      }));

      const assistantMsg = {
        role:           'assistant',
        content:        reply,
        time:           now(),
        profs:          profs_enrichis,
        noProfs:        res.data.noProfs,
        besoin_complet,
        prochain_critere,
        alternative:    res.data.alternative || null,
        criteres:       criteres_msg,
      };
      setMsgs(prev => [...prev, assistantMsg]);

      // Sauvegarder réponse assistant en base
      if (sessionId) {
        try { await api.post(`/api/chatbot/sessions/${sessionId}/messages`, { role:'assistant', content:reply, top3_profs: hasProfs ? top3_profs : [], alternative: res.data.alternative || null, noProfs: res.data.noProfs || false, besoin_complet: res.data.besoin_complet || false, criteres: res.data.criteres || {} }); } catch {}
      }

      // Mettre à jour le titre de la session avec le premier message
      const isFirst = msgs.length === 0;
      if (isFirst && sessionId) {
        const titre = txt.slice(0,50) + (txt.length>50?'…':'');
        setSessions(prev => prev.map(s => s.id===sessionId ? {...s,titre} : s));
        if (activeSession?.id === sessionId) setActiveSession(prev => ({...prev, titre}));
      }

    } catch(e) {
      const s = e?.response?.status;
      const m = s===503?'⏳ Modèle en démarrage, réessayez.':s===429?'⚠️ Trop de requêtes.':s===504?'⏱️ Délai dépassé.':'❌ Erreur. Réessayez.';
      setMsgs(prev => [...prev, {role:'assistant',content:m,time:now(),profs:[]}]);
    } finally {
      setLoading(false);
      setTimeout(()=>inputRef.current?.focus(),100);
    }
  },[input, msgs, loading, activeSession]);

  const onKey = (e) => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} };

  // ── Formatage date session ──
  const fmtDate = (str) => {
    if (!str) return '';
    const d = new Date(str);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Hier';
    if (diff < 7)  return `Il y a ${diff} jours`;
    return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  };

  return (
    <div style={{ display:'flex', height:'calc(100vh - 64px)', background:'var(--bg)' }}>
      <style>{`
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
        .session-item{padding:10px 12px;border-radius:11px;cursor:pointer;transition:all .15s;border:1.5px solid transparent;position:relative;}
        .session-item:hover{background:var(--surface2);border-color:var(--border);}
        .session-item.active{background:rgba(108,99,255,0.1);border-color:rgba(108,99,255,0.3);}
        .session-actions{display:none;position:absolute;right:8px;top:50%;transform:translateY(-50%);gap:4px;}
        .session-item:hover .session-actions{display:flex;}
        .session-act-btn{width:24px;height:24px;border-radius:6px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .15s;}
      `}</style>

      {/* ════ SIDEBAR SESSIONS ════ */}
      <div style={{ width:260,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0 }}>

        {/* Header sidebar */}
        <div style={{ padding:'16px 14px 12px',borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
            <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>🤖</div>
            <div style={{ fontWeight:800,fontSize:14,color:'var(--text)' }}>EduBot</div>
          </div>
          <button onClick={newSession}
            style={{ width:'100%',padding:'9px',background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',border:'none',borderRadius:11,cursor:'pointer',color:'#fff',fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 3px 10px rgba(108,99,255,0.3)',transition:'all .18s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='none'}>
            ✏️ Nouvelle conversation
          </button>
        </div>

        {/* Liste sessions */}
        <div className="chat-scroll" style={{ flex:1,overflowY:'auto',padding:'10px 10px' }}>
          {loadingSessions ? (
            <div style={{ textAlign:'center',padding:20,color:'var(--text3)',fontSize:12 }}>Chargement...</div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign:'center',padding:20,color:'var(--text3)',fontSize:12,fontStyle:'italic' }}>
              Aucune conversation<br/>Commencez dès maintenant !
            </div>
          ) : (
            sessions.map(s => (
              <div key={s.id} className={`session-item${activeSession?.id===s.id?' active':''}`}
                onClick={()=>{ if(editingId!==s.id) openSession(s); }}>

                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e=>setEditTitle(e.target.value)}
                    onBlur={()=>renameSession(s.id, editTitle||s.titre)}
                    onKeyDown={e=>{ if(e.key==='Enter') renameSession(s.id, editTitle||s.titre); if(e.key==='Escape') setEditingId(null); }}
                    onClick={e=>e.stopPropagation()}
                    style={{ width:'100%',background:'var(--surface)',border:'1.5px solid #6c63ff',borderRadius:7,padding:'4px 8px',fontSize:12,color:'var(--text)',outline:'none',boxSizing:'border-box' }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize:13,fontWeight:activeSession?.id===s.id?700:500,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',paddingRight:52 }}>
                      {s.titre}
                    </div>
                    <div style={{ fontSize:11,color:'var(--text3)',marginTop:2 }}>
                      {fmtDate(s.updated_at || s.created_at)}
                      {s.nb_messages>0 && <span style={{ marginLeft:6 }}>· {s.nb_messages} msgs</span>}
                    </div>
                    <div className="session-actions">
                      {/* Renommer */}
                      <button className="session-act-btn"
                        onClick={e=>{ e.stopPropagation(); setEditingId(s.id); setEditTitle(s.titre); }}
                        style={{ background:'var(--surface2)',color:'var(--text2)' }}
                        title="Renommer"
                        onMouseEnter={e=>{e.currentTarget.style.background='#EFF6FF';e.currentTarget.style.color='#3b82f6';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='var(--surface2)';e.currentTarget.style.color='var(--text2)';}}>
                        ✏️
                      </button>
                      {/* Supprimer */}
                      <button className="session-act-btn"
                        onClick={e=>{ e.stopPropagation(); setConfirmDelete(s); }}
                        style={{ background:'var(--surface2)',color:'var(--text2)' }}
                        title="Supprimer"
                        onMouseEnter={e=>{e.currentTarget.style.background='#FEF2F2';e.currentTarget.style.color='#dc2626';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='var(--surface2)';e.currentTarget.style.color='var(--text2)';}}>
                        🗑
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer sidebar */}
        <div style={{ padding:'10px 14px',borderTop:'1px solid var(--border)',fontSize:11,color:'var(--text3)',textAlign:'center' }}>
          {sessions.length} conversation{sessions.length!==1?'s':''}
        </div>
      </div>

      {/* ════ ZONE CHAT ════ */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0 }}>

        {/* Header */}
        <div style={{ padding:'14px 24px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:13,background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 12px rgba(108,99,255,0.35)',flexShrink:0 }}>🤖</div>
            <div>
              <div style={{ fontWeight:800,fontSize:15,color:'var(--text)' }}>
                {activeSession ? activeSession.titre : 'EduBot — Assistant intelligent'}
              </div>
              <div style={{ fontSize:12,color:'var(--text2)',display:'flex',alignItems:'center',gap:5 }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block',boxShadow:'0 0 4px #22c55e' }}/>
                En ligne · Matching IA · EduMatch Tunisie
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>

            {activeSession && (
              <button onClick={newSession}
                style={{ padding:'7px 14px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:9,cursor:'pointer',fontSize:12,color:'var(--text2)',fontWeight:600,display:'flex',alignItems:'center',gap:5,transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.color='#6c63ff';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)';}}>
                ✏️ Nouveau
              </button>
            )}
          </div>
        </div>

        {/* Messages ou Mode Guidé */}
        {chatMode === 'guide' && (!msgs.length || welcome) ? (
          <div style={{ flex:1, overflowY:'auto' }}>
            <GuidedMode
              onSend={(msg) => { setChatMode('libre'); send(msg); }}
              onExit={() => setChatMode('libre')}
            />
          </div>
        ) : null}
        <div className="chat-scroll" style={{ flex:1,overflowY:'auto',padding:'28px 28px 16px', display: chatMode === 'guide' && (!msgs.length || welcome) ? 'none' : 'block' }}>
          {welcome && !activeSession && (
            <div style={{ textAlign:'center',paddingBottom:32 }}>
              <div style={{ width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 20px',boxShadow:'0 8px 24px rgba(108,99,255,0.35)' }}>🤖</div>
              <h2 style={{ fontSize:'1.4rem',fontWeight:800,margin:'0 0 8px',color:'var(--text)' }}>Bonjour {user?.prenom} ! 👋</h2>
              <p style={{ color:'var(--text2)',fontSize:14,lineHeight:1.7,maxWidth:460,margin:'0 auto 28px' }}>
                Je suis <strong style={{ color:'var(--text)' }}>EduBot</strong>, votre assistant de matching EduMatch.
                Décrivez votre besoin et je trouve les meilleurs professeurs.
              </p>

            </div>
          )}
          {msgs.map((msg,i)=><Message key={i} msg={msg} onViewProf={handleView}/>)}
          {loading&&<Typing/>}
          <div ref={bottomRef}/>
        </div>

        {/* Input — masqué en mode guidé initial */}
        <div style={{ padding:'12px 24px 18px',background:'var(--surface)',borderTop:'1px solid var(--border)',flexShrink:0,
          display: chatMode === 'guide' && (!msgs.length || welcome) ? 'none' : 'block' }}>
          <div style={{ display:'flex',gap:10,alignItems:'flex-end',background:'var(--surface2)',border:'1.5px solid var(--border)',borderRadius:16,padding:'8px 10px 8px 16px',transition:'border-color .2s,box-shadow .2s' }}
            onFocusCapture={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.boxShadow='0 0 0 3px rgba(108,99,255,0.1)';}}
            onBlurCapture={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}>
            <textarea ref={el=>{inputRef.current=el;taRef.current=el;}} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Ex: Je cherche un prof de maths pour le bac, en ligne, budget 35 DT/h..."
              rows={1} style={{ flex:1,background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:14,lineHeight:1.55,resize:'none',maxHeight:120,fontFamily:'inherit',paddingTop:5,paddingBottom:5,overflowY:'auto' }}
              onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';}}/>
            <button onClick={()=>send()} disabled={!input.trim()||loading}
              style={{ width:40,height:40,borderRadius:11,border:'none',flexShrink:0,cursor:!input.trim()||loading?'not-allowed':'pointer',background:!input.trim()||loading?'var(--border)':'linear-gradient(135deg,#6c63ff,#8b5cf6)',color:'#fff',fontSize:17,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',boxShadow:input.trim()&&!loading?'0 3px 10px rgba(108,99,255,0.3)':'none' }}>
              {loading?'⏳':'➤'}
            </button>
          </div>
          <div style={{ fontSize:11,color:'var(--text2)',marginTop:5,textAlign:'center' }}>Entrée pour envoyer · Shift+Entrée pour saut de ligne</div>
        </div>
      </div>

      {/* ════ PANNEAU LATÉRAL conseils ════ */}

      {confirmDelete && (
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,.7)',backdropFilter:'blur(6px)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div style={{ background:'var(--surface)',borderRadius:22,width:'100%',maxWidth:360,padding:26,boxShadow:'0 40px 100px rgba(0,0,0,.2)',border:'1.5px solid var(--border)' }}>
            <div style={{ width:50,height:50,borderRadius:14,background:'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',margin:'0 auto 14px' }}>🗑️</div>
            <div style={{ textAlign:'center',marginBottom:6 }}>
              <div style={{ fontWeight:900,fontSize:'1rem',color:'var(--text)' }}>Supprimer cette conversation ?</div>
            </div>
            <div style={{ textAlign:'center',marginBottom:20 }}>
              <div style={{ fontSize:'.83rem',color:'var(--text2)',lineHeight:1.6 }}>
                "<strong>{confirmDelete.titre}</strong>" sera définitivement supprimée.
              </div>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>setConfirmDelete(null)}
                style={{ flex:1,padding:'11px',borderRadius:12,border:'1.5px solid var(--border)',background:'var(--surface2)',color:'var(--text2)',fontWeight:700,cursor:'pointer',fontSize:'.88rem' }}>
                Annuler
              </button>
              <button onClick={()=>deleteSession(confirmDelete.id)}
                style={{ flex:1,padding:'11px',borderRadius:12,border:'none',background:'#DC2626',color:'#fff',fontWeight:800,cursor:'pointer',fontSize:'.88rem',boxShadow:'0 4px 14px rgba(220,38,38,0.3)' }}>
                🗑 Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProf&&<ProfModal prof={selectedProf} onClose={()=>setSelectedProf(null)}/>}
    </div>
  );
}