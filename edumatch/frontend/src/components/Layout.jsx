import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ─── Navigation ── */
const NAV = {
  étudiant: [
    { path:'/home',         icon:'🏠', label:'Accueil'          },
    { path:'/chatbot',      icon:'🤖', label:'Assistant IA',    badge:'NEW' },
    { path:'/profs',        icon:'👨‍🏫', label:'Formateurs'      },
    { path:'/favoris',      icon:'❤️', label:'Mes favoris'      },
    { path:'/reservations', icon:'📋', label:'Mes Réservations' },
    { path:'/profil',       icon:'👤', label:'Mon profil'       },
  ],
  professeur: [
    { path:'/prof',   icon:'📊', label:'Tableau de bord' },
    { path:'/dispos', icon:'🗓', label:'Disponibilités'  },
    { path:'/profil', icon:'👤', label:'Mon profil'      },
  ],
  admin: [
    { path:'/admin',  icon:'🛠', label:'Dashboard Admin' },
    { path:'/profs',  icon:'👨‍🏫', label:'Formateurs'    },
    { path:'/profil', icon:'👤', label:'Mon profil'      },
  ],
};

/* ─── CSS ── */
const LAYOUT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');

  @keyframes pulse-badge { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
  @keyframes notifIn  { from{opacity:0;transform:translateY(-10px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes settingsIn { from{opacity:0;transform:translateX(20px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  html,body { margin:0;padding:0;overflow:hidden;height:100%; }
  #root { height:100%; }

  /* ─── Thème clair (défaut) ─── */
  :root, [data-theme="light"] {
    --bg:           #F8FAFC;
    --surface:      #FFFFFF;
    --surface2:     #F1F5F9;
    --surface3:     #E2E8F0;
    --border:       #F1F5F9;
    --border2:      #E2E8F0;
    --text:         #0F172A;
    --text2:        #64748B;
    --text3:        #94A3B8;
    --accent:       #00153D;
    --accent2:      #3B82F6;
    --sidebar-bg:   #FFFFFF;
    --topbar-bg:    #FFFFFF;
    --nav-active-bg:    rgba(59,130,246,0.08);
    --nav-active-color: #1E40AF;
    --nav-active-border:rgba(59,130,246,0.2);
    --shadow-sm:    0 1px 3px rgba(0,0,0,0.06);
    --danger:       #DC2626;
    --danger-bg:    #FEF2F2;
    --danger-border:#FCA5A5;
  }

  /* ─── Thème sombre ─── */
  [data-theme="dark"] {
    --bg:           #0A0F1A;
    --surface:      #111827;
    --surface2:     #1E293B;
    --surface3:     #334155;
    --border:       #1E293B;
    --border2:      #334155;
    --text:         #F1F5F9;
    --text2:        #94A3B8;
    --text3:        #64748B;
    --accent:       #60A5FA;
    --accent2:      #3B82F6;
    --sidebar-bg:   #111827;
    --topbar-bg:    #111827;
    --nav-active-bg:    rgba(59,130,246,0.15);
    --nav-active-color: #93C5FD;
    --nav-active-border:rgba(59,130,246,0.35);
    --shadow-sm:    0 1px 3px rgba(0,0,0,0.3);
    --danger:       #F87171;
    --danger-bg:    rgba(239,68,68,0.1);
    --danger-border:rgba(239,68,68,0.3);
  }

  .ly-wrap { display:flex; height:100vh; overflow:hidden; background:var(--bg); }

  .ly-sidebar {
    width:256px; height:100vh; display:flex; flex-direction:column;
    background:var(--sidebar-bg); border-right:1.5px solid var(--border);
    box-shadow:var(--shadow-sm); flex-shrink:0; overflow:hidden;
    transition:background .25s, border-color .25s;
  }

  .ly-right { flex:1; display:flex; flex-direction:column; height:100vh; overflow:hidden; min-width:0; }

  .ly-topbar {
    height:64px; min-height:64px; background:var(--topbar-bg);
    border-bottom:1.5px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 32px; box-shadow:var(--shadow-sm); flex-shrink:0; z-index:10;
    transition:background .25s, border-color .25s;
  }

  .ly-content { flex:1; overflow-y:auto; background:var(--bg); transition:background .25s; }

  .nav-item {
    display:flex; align-items:center; gap:11px;
    padding:10px 14px; border-radius:12px; cursor:pointer;
    transition:all .2s cubic-bezier(.22,1,.36,1);
    font-size:.875rem; font-weight:600; position:relative;
    border:1.5px solid transparent; color:var(--text2);
    font-family:'Instrument Sans',sans-serif;
  }
  .nav-item:hover { background:var(--nav-active-bg); color:var(--nav-active-color); border-color:var(--nav-active-border); transform:translateX(3px); }
  .nav-item.active { background:var(--nav-active-bg); color:var(--nav-active-color); border-color:var(--nav-active-border); font-family:'Cabinet Grotesk',sans-serif; font-weight:800; }

  .topbar-btn {
    width:40px; height:40px; border-radius:11px;
    background:var(--surface2); border:1.5px solid var(--border2);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .18s; font-size:1rem; color:var(--text2);
  }
  .topbar-btn:hover { border-color:var(--accent2); background:var(--nav-active-bg); color:var(--nav-active-color); }
  .topbar-btn.active { background:var(--nav-active-bg); border-color:var(--nav-active-border); }

  .notif-item { display:flex; gap:13px; padding:13px 18px; cursor:pointer; transition:background .15s; }
  .notif-item:hover { background:var(--surface2) !important; }

  .logout-btn-sidebar {
    display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-radius:12px; cursor:pointer;
    border:1.5px solid var(--danger-border); background:var(--danger-bg);
    color:var(--danger); font-size:.84rem; font-weight:700;
    font-family:'Cabinet Grotesk',sans-serif; transition:all .18s;
    width:100%;
  }
  .logout-btn-sidebar:hover { background:var(--danger); color:#fff; transform:translateX(2px); }

  /* ─── Settings panel ─── */
  .settings-panel {
    position:fixed; top:64px; right:24px;
    width:360px; max-height:calc(100vh - 80px);
    background:var(--surface); border:1.5px solid var(--border2);
    border-radius:22px; box-shadow:0 32px 80px rgba(0,0,0,0.2);
    z-index:299; overflow:hidden; display:flex; flex-direction:column;
    animation:settingsIn .22s cubic-bezier(.22,1,.36,1);
  }

  .settings-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 20px; border-bottom:1px solid var(--border);
    transition:background .15s;
  }
  .settings-row:hover { background:var(--surface2); }
  .settings-row:last-child { border-bottom:none; }

  /* Toggle switch */
  .toggle-track {
    width:44px; height:24px; border-radius:12px; cursor:pointer;
    border:none; transition:background .25s; position:relative; flex-shrink:0;
  }
  .toggle-thumb {
    position:absolute; top:3px; width:18px; height:18px;
    border-radius:50%; background:#fff; transition:left .25s cubic-bezier(.22,1,.36,1);
    box-shadow:0 2px 6px rgba(0,0,0,0.2);
  }
`;

function injectLayoutCSS() {
  if (!document.getElementById('layout-css')) {
    const s = document.createElement('style'); s.id='layout-css'; s.textContent=LAYOUT_CSS;
    document.head.appendChild(s);
  }
}

/* ─── Dark mode ── */
function useDarkMode() {
  const [dark, setDark] = useState(()=>{
    try { return localStorage.getItem('edumatch_theme')==='dark'; } catch { return false; }
  });
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', dark?'dark':'light');
    try { localStorage.setItem('edumatch_theme', dark?'dark':'light'); } catch {}
  },[dark]);
  useEffect(()=>{
    const saved = (()=>{ try { return localStorage.getItem('edumatch_theme')||'light'; } catch { return 'light'; } })();
    document.documentElement.setAttribute('data-theme', saved);
  },[]);
  return [dark, setDark];
}

/* ─── Notifications ── */
function useNotifications(user) {
  const [notifs, setNotifs]       = useState([]);
  const [unread, setUnread]       = useState(0);
  const [msgUnread, setMsgUnread] = useState(0);
  const readIds = useRef(new Set(JSON.parse(localStorage.getItem('edumatch_notif_read')||'[]')));

  const markId = (id) => {
    readIds.current.add(id);
    try { localStorage.setItem('edumatch_notif_read', JSON.stringify([...readIds.current])); } catch {}
  };

  const buildResaNotifs = useCallback((reservations, role) => {
    const list = [];
    if (role==='professeur') {
      reservations.forEach(r => {
        if (r.statut==='en_attente') list.push({
          id:`resa-pending-${r.id}`, type:'pending', icon:'📩',
          title:'Nouvelle demande', body:`${r.etudiant_nom||'Un étudiant'} souhaite réserver un cours`,
          detail:`📅 ${r.date_cours} · 🕒 ${String(r.heure_debut||'').slice(0,5)}–${String(r.heure_fin||'').slice(0,5)}`,
          mode:r.mode_seance, color:'#B45309', bg:'#FFFBEB', border:'#FCD34D',
          time:r.created_at, path:'/prof', read:readIds.current.has(`resa-pending-${r.id}`), resa_id:r.id,
        });
      });
    }
    if (role==='étudiant') {
      reservations.forEach(r => {
        if (r.statut==='confirmé') list.push({
          id:`resa-ok-${r.id}`, type:'confirmed', icon:'🎉',
          title:'Réservation acceptée !', body:`${r.prof_nom||'Votre professeur'} a accepté votre demande`,
          detail:`📅 ${r.date_cours} · 🕒 ${String(r.heure_debut||'').slice(0,5)}`,
          mode:r.mode_seance, lien:r.lien_meet,
          color:'#065F46', bg:'#ECFDF5', border:'#6EE7B7',
          time:r.created_at, path:'/reservations', read:readIds.current.has(`resa-ok-${r.id}`),
        });
        if (r.statut==='refusé') list.push({
          id:`resa-refused-${r.id}`, type:'refused', icon:'❌',
          title:'Réservation refusée', body:`${r.prof_nom||'Le professeur'} ne peut pas assurer ce cours`,
          detail:`📅 ${r.date_cours}`,
          color:'#991B1B', bg:'#FEF2F2', border:'#FCA5A5',
          time:r.created_at, path:'/reservations', read:true,
        });
        if (r.statut==='en_attente') list.push({
          id:`resa-wait-${r.id}`, type:'waiting', icon:'⏳',
          title:'Demande en cours', body:`En attente de confirmation de ${r.prof_nom||'votre professeur'}`,
          detail:`📅 ${r.date_cours} · 🕒 ${String(r.heure_debut||'').slice(0,5)}`,
          mode:r.mode_seance,
          color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE',
          time:r.created_at, path:'/reservations', read:true,
        });
      });
    }
    return list;
  },[]);

  const buildMsgNotifs = useCallback((messages, role, reservations) => {
    return messages.map(m => {
      const resa = reservations.find(r=>r.id===m.reservation_id);
      const apercu = m.contenu ? m.contenu.slice(0,60)+(m.contenu.length>60?'…':'') : m.fichier_nom ? `📎 ${m.fichier_nom}` : 'Nouveau fichier';
      return {
        id:`msg-${m.id}`, type:'message', icon:'💬',
        title: role==='professeur' ? `Message de ${m.expediteur_nom||'Étudiant'}` : `Réponse de ${m.expediteur_nom||'Professeur'}`,
        body:apercu,
        detail: resa ? `📅 ${resa.date_cours} · 🕒 ${String(resa.heure_debut||'').slice(0,5)}` : '',
        color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE',
        time:m.created_at, path: role==='professeur'?'/prof':'/reservations',
        read:readIds.current.has(`msg-${m.id}`), resa_id:m.reservation_id, msg_id:m.id,
      };
    });
  },[]);

  const prevUnread = useRef(0);
  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const isAdmin = user.role === 'admin';
      const baseReqs = [
        api.get('/api/reservations/mes-reservations'),
        api.get('/api/messages/non-lus'),
      ];
      if (isAdmin) {
        baseReqs.push(api.get('/api/admin/professeurs/all').catch(()=>({data:[]})));
        baseReqs.push(api.get('/api/admin/demandes-matieres').catch(()=>({data:[]})));
      }
      const results = await Promise.all(baseReqs);
      const reservations = results[0].data||[];
      const nonLus = results[1].data?.messages||[];

      // Notifs admin
      let adminNotifs = [];
      if (isAdmin) {
        const allProfs  = results[2]?.data||[];
        const demandes  = results[3]?.data||[];
        const profsEnAttente = allProfs.filter(p=>p.statut_validation==='en_attente');
        profsEnAttente.forEach(p => {
          const nm = `${p.user_prenom||''} ${p.user_nom||''}`.trim()||'Formateur';
          const id = `admin-prof-${p.id}`;
          adminNotifs.push({
            id, type:'admin_prof', icon:'👨‍🏫',
            title:'Nouveau profil à valider',
            body:`${nm} souhaite rejoindre la plateforme`,
            detail:`📍 ${p.ville||'Ville non renseignée'} · ${p.mode_enseignement||''}`,
            color:'#B45309', bg:'#FFFBEB', border:'#FCD34D',
            time: p.created_at, path:'/admin?tab=profs', read:readIds.current.has(id),
          });
        });
        demandes.filter(d=>d.statut==='en_attente').forEach(d => {
          const id = `admin-dem-${d.id}`;
          adminNotifs.push({
            id, type:'admin_demande', icon:'💡',
            title:'Demande de matière',
            body:`${d.prof_nom||'Un formateur'} propose "${d.nom_matiere}"`,
            detail:`🎓 Niveau : ${d.nom_niveau||'—'}`,
            color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE',
            time: d.created_at, path:'/admin?tab=demandes', read:readIds.current.has(id),
          });
        });
      }

      const resa = buildResaNotifs(reservations, user.role);
      const msgs = buildMsgNotifs(nonLus, user.role, reservations);
      const all = [...msgs,...resa,...adminNotifs].sort((a,b)=>{
        if(!a.read&&b.read) return -1;
        if(a.read&&!b.read) return 1;
        return new Date(b.time||0)-new Date(a.time||0);
      });
      const newUnread = all.filter(n=>!n.read).length;
      // Son de notification si nouveaux messages
      if (newUnread > prevUnread.current && prevUnread.current >= 0) {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(880,ctx.currentTime);
          osc.frequency.setValueAtTime(1100,ctx.currentTime+0.1);
          gain.gain.setValueAtTime(0.1,ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.3);
        } catch {}
      }
      prevUnread.current = newUnread;
      setNotifs(all);
      setUnread(newUnread);
      setMsgUnread(msgs.length);
    } catch {}
  },[user,buildResaNotifs,buildMsgNotifs]);

  useEffect(()=>{ fetchNotifs(); const iv=setInterval(fetchNotifs,15000); return ()=>clearInterval(iv); },[fetchNotifs]);

  const markAllRead = useCallback(()=>{
    setNotifs(prev => prev.map(n=>{ markId(n.id); return {...n,read:true}; }));
    setUnread(0);
  },[]);

  const markOneRead = useCallback((id)=>{
    markId(id);
    setNotifs(prev => prev.map(n=>n.id===id?{...n,read:true}:n));
    setUnread(prev=>Math.max(0,prev-1));
  },[]);

  return { notifs, unread, markAllRead, markOneRead, refresh:fetchNotifs, msgUnread };
}

/* ─── Notif Time ── */
function NotifTime({ str }) {
  if (!str) return null;
  const d=new Date(str), diff=Math.floor((new Date()-d)/1000);
  if (diff<60)    return <span>À l'instant</span>;
  if (diff<3600)  return <span>Il y a {Math.floor(diff/60)} min</span>;
  if (diff<86400) return <span>Il y a {Math.floor(diff/3600)}h</span>;
  return <span>{d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</span>;
}

/* ─── Notif Item ── */
function NotifItem({ n, isLast, onNavigate, onClose, onOpenChat, onOpenResa, onMarkRead }) {
  const isMsg = n.type==='message';
  return (
    <div className="notif-item"
      onClick={()=>{ onMarkRead(n.id); if(isMsg&&onOpenChat) onOpenChat(n.resa_id); else if(n.type==='pending'&&onOpenResa) onOpenResa(n.resa_id); else { const [p,q]=n.path.split('?'); onNavigate(q?`${p}?${q}`:p); } onClose(); }}
      style={{ borderBottom:isLast?'none':`1px solid var(--border)`, background:!n.read?`${n.bg}55`:'transparent', position:'relative' }}>
      {!n.read&&<div style={{ position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',width:6,height:6,borderRadius:'50%',background:n.color }}/>}
      <div style={{ width:42,height:42,borderRadius:12,flexShrink:0,background:n.bg,border:`1.5px solid ${n.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.05rem' }}>{n.icon}</div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:3 }}>
          <div style={{ fontFamily:!n.read?'Cabinet Grotesk,sans-serif':'inherit',fontWeight:!n.read?800:600,fontSize:'.84rem',color:'var(--text)' }}>{n.title}</div>
          <div style={{ fontSize:'.66rem',color:'var(--text3)',whiteSpace:'nowrap',marginLeft:8,flexShrink:0 }}><NotifTime str={n.time}/></div>
        </div>
        <div style={{ fontSize:'.78rem',color:'var(--text2)',marginBottom:3,lineHeight:1.45 }}>{n.body}</div>
        {n.detail&&<div style={{ fontSize:'.71rem',color:n.color,fontWeight:700 }}>{n.detail}</div>}
        {isMsg&&<div style={{ marginTop:5,display:'inline-flex',alignItems:'center',gap:4,fontSize:'.68rem',fontWeight:800,color:'#1D4ED8',background:'#EFF6FF',padding:'3px 10px',borderRadius:20,border:'1.5px solid #BFDBFE',fontFamily:'Cabinet Grotesk,sans-serif' }}>💬 Ouvrir la conversation</div>}
        {n.lien&&<a href={n.lien} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ display:'inline-flex',alignItems:'center',gap:4,marginTop:5,fontSize:'.68rem',fontWeight:700,color:'#065F46',background:'#ECFDF5',padding:'3px 10px',borderRadius:20,textDecoration:'none',border:'1.5px solid #6EE7B7' }}>🎥 Rejoindre le Meet</a>}
        {n.mode&&<span style={{ display:'inline-flex',alignItems:'center',gap:3,marginTop:4,fontSize:'.66rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:n.mode==='en_ligne'?'#EFF6FF':'#ECFDF5',color:n.mode==='en_ligne'?'#1D4ED8':'#065F46',border:`1.5px solid ${n.mode==='en_ligne'?'#BFDBFE':'#6EE7B7'}` }}>{n.mode==='en_ligne'?'🌐 En ligne':'🏫 Présentiel'}</span>}
      </div>
    </div>
  );
}

/* ─── Panneau Notifications ── */
function NotificationPanel({ notifs, unread, onMarkAllRead, onNavigate, onClose, onOpenChat, onOpenResa, onMarkOneRead }) {
  const msgs   = notifs.filter(n=>n.type==='message');
  const adminN = notifs.filter(n=>n.type==='admin_prof'||n.type==='admin_demande');
  const resas  = notifs.filter(n=>n.type!=='message'&&n.type!=='admin_prof'&&n.type!=='admin_demande');
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:298 }}/>
      <div style={{ position:'fixed',top:64,right:24,width:420,maxHeight:'calc(100vh - 80px)',background:'var(--surface)',border:'1.5px solid var(--border2)',borderRadius:22,boxShadow:'0 32px 80px rgba(0,0,0,0.2)',zIndex:299,overflow:'hidden',animation:'notifIn .22s cubic-bezier(.22,1,.36,1)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'16px 20px 14px',borderBottom:`1.5px solid var(--border)`,display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--surface)',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'1rem',color:'var(--text)',margin:0 }}>Notifications</h3>
            {unread>0&&<span style={{ background:'#EF4444',color:'#fff',fontSize:'.63rem',fontWeight:900,padding:'2px 9px',borderRadius:20 }}>{unread} nouveau{unread>1?'x':''}</span>}
          </div>
          <div style={{ display:'flex',gap:8 }}>
            {unread>0&&<button onClick={onMarkAllRead} style={{ fontSize:'.73rem',color:'var(--accent2)',background:'var(--nav-active-bg)',border:`1.5px solid var(--nav-active-border)`,borderRadius:20,padding:'4px 12px',cursor:'pointer',fontWeight:700 }}>✓ Tout lire</button>}
            <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:'var(--surface2)',border:`1.5px solid var(--border2)`,cursor:'pointer',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem' }}>✕</button>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto' }}>
          {notifs.length===0 ? (
            <div style={{ textAlign:'center',padding:'56px 20px',color:'var(--text3)' }}>
              <div style={{ fontSize:'3rem',marginBottom:14 }}>🔕</div>
              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:'1rem',color:'var(--text)',marginBottom:5 }}>Aucune notification</div>
              <div style={{ fontSize:'.82rem',fontStyle:'italic' }}>Tout est à jour !</div>
            </div>
          ) : (
            <>
              {msgs.length>0&&(
                <>
                  <div style={{ padding:'9px 20px 7px',fontSize:'.66rem',fontWeight:900,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.12em',background:'var(--surface2)',borderBottom:`1px solid var(--border)` }}>💬 Messages non lus · {msgs.length}</div>
                  {msgs.map((n,i)=><NotifItem key={n.id} n={n} isLast={i===msgs.length-1&&resas.length===0} onNavigate={onNavigate} onClose={onClose} onOpenChat={onOpenChat} onOpenResa={onOpenResa} onMarkRead={onMarkOneRead}/>)}
                </>
              )}
              {resas.length>0&&(
                <>
                  {msgs.length>0&&<div style={{ padding:'9px 20px 7px',fontSize:'.66rem',fontWeight:900,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.12em',background:'var(--surface2)',borderBottom:`1px solid var(--border)` }}>📅 Réservations · {resas.length}</div>}
                  {resas.map((n,i)=><NotifItem key={n.id} n={n} isLast={i===resas.length-1&&adminN.length===0} onNavigate={onNavigate} onClose={onClose} onOpenChat={onOpenChat} onOpenResa={onOpenResa} onMarkRead={onMarkOneRead}/>)}
                </>
              )}
              {adminN.length>0&&(
                <>
                  <div style={{ padding:'9px 20px 7px',fontSize:'.66rem',fontWeight:900,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.12em',background:'var(--surface2)',borderBottom:`1px solid var(--border)` }}>🛠 Admin · {adminN.length}</div>
                  {adminN.map((n,i)=><NotifItem key={n.id} n={n} isLast={i===adminN.length-1} onNavigate={onNavigate} onClose={onClose} onOpenChat={onOpenChat} onMarkRead={onMarkOneRead}/>)}
                </>
              )}
            </>
          )}
        </div>
        {notifs.length>0&&(
          <div style={{ padding:'10px 18px',borderTop:`1px solid var(--border)`,textAlign:'center',background:'var(--surface)',flexShrink:0 }}>
            <span style={{ fontSize:'.73rem',color:'var(--text3)',fontWeight:600 }}>{notifs.length} notification{notifs.length>1?'s':''} au total</span>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Toggle Switch ── */
function Toggle({ checked, onChange, color='#3B82F6' }) {
  return (
    <button className="toggle-track"
      onClick={()=>onChange(!checked)}
      style={{ background:checked?color:'var(--surface3)' }}>
      <div className="toggle-thumb" style={{ left:checked?'23px':'3px' }}/>
    </button>
  );
}

/* ─── Panneau Paramètres ── */
function SettingsPanel({ onClose, dark, setDark, notifSound, setNotifSound, user, onLogout }) {
  const navigate = useNavigate();
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:298 }}/>
      <div className="settings-panel">
        {/* Header */}
        <div style={{ padding:'16px 20px 14px',borderBottom:`1.5px solid var(--border)`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.95rem' }}>⚙️</div>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'1rem',color:'var(--text)',margin:0 }}>Paramètres</h3>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:'var(--surface2)',border:`1.5px solid var(--border2)`,cursor:'pointer',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem' }}>✕</button>
        </div>

        <div style={{ overflowY:'auto',flex:1 }}>
          {/* Section Apparence */}
          <div style={{ padding:'12px 20px 4px' }}>
            <div style={{ fontSize:'.65rem',fontWeight:900,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.12em' }}>Apparence</div>
          </div>

          <div className="settings-row">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:dark?'#1E293B':'#F0F4FF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem' }}>{dark?'🌙':'☀️'}</div>
              <div>
                <div style={{ fontWeight:700,fontSize:'.88rem',color:'var(--text)' }}>Mode sombre</div>
                <div style={{ fontSize:'.72rem',color:'var(--text3)',marginTop:2 }}>{dark?'Thème sombre actif':'Thème clair actif'}</div>
              </div>
            </div>
            <Toggle checked={dark} onChange={setDark} color='#6366F1'/>
          </div>

          {/* Section Notifications */}
          <div style={{ padding:'12px 20px 4px',borderTop:`1px solid var(--border)` }}>
            <div style={{ fontSize:'.65rem',fontWeight:900,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.12em' }}>Notifications</div>
          </div>

          <div className="settings-row">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'#FEF3C7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem' }}>🔔</div>
              <div>
                <div style={{ fontWeight:700,fontSize:'.88rem',color:'var(--text)' }}>Son de notification</div>
                <div style={{ fontSize:'.72rem',color:'var(--text3)',marginTop:2 }}>Bip lors de nouveaux messages</div>
              </div>
            </div>
            <Toggle checked={notifSound} onChange={setNotifSound} color='#F59E0B'/>
          </div>

          {/* Section Compte */}
          <div style={{ padding:'12px 20px 4px',borderTop:`1px solid var(--border)` }}>
            <div style={{ fontSize:'.65rem',fontWeight:900,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.12em' }}>Compte</div>
          </div>

          <div className="settings-row" style={{ cursor:'pointer' }} onClick={()=>{ navigate('/profil'); onClose(); }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem' }}>👤</div>
              <div>
                <div style={{ fontWeight:700,fontSize:'.88rem',color:'var(--text)' }}>Mon profil</div>
                <div style={{ fontSize:'.72rem',color:'var(--text3)',marginTop:2 }}>{user?.email||''}</div>
              </div>
            </div>
            <span style={{ color:'var(--text3)',fontSize:'.85rem' }}>→</span>
          </div>

          <div className="settings-row" style={{ cursor:'pointer' }} onClick={()=>{ navigate('/profil'); onClose(); }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'#F0FDF4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem' }}>🔒</div>
              <div>
                <div style={{ fontWeight:700,fontSize:'.88rem',color:'var(--text)' }}>Modifier le mot de passe</div>
                <div style={{ fontSize:'.72rem',color:'var(--text3)',marginTop:2 }}>Sécurité du compte</div>
              </div>
            </div>
            <span style={{ color:'var(--text3)',fontSize:'.85rem' }}>→</span>
          </div>

          {/* Infos */}
          <div style={{ padding:'12px 20px 4px',borderTop:`1px solid var(--border)` }}>
            <div style={{ fontSize:'.65rem',fontWeight:900,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.12em' }}>À propos</div>
          </div>

          <div className="settings-row" style={{ cursor:'default' }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#00153D,#3B82F6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem' }}>🎓</div>
              <div>
                <div style={{ fontWeight:700,fontSize:'.88rem',color:'var(--text)' }}>EduMatch</div>
                <div style={{ fontSize:'.72rem',color:'var(--text3)',marginTop:2 }}>Projet PFE 2025/2026</div>
              </div>
            </div>
            <span style={{ fontSize:'.72rem',color:'var(--text3)',fontWeight:700 }}>v1.0</span>
          </div>

          {/* Déconnexion */}
          <div style={{ padding:'16px 20px',borderTop:`1.5px solid var(--border)` }}>
            <button onClick={onLogout}
              style={{ width:'100%',padding:'12px',borderRadius:14,border:`1.5px solid var(--danger-border)`,background:'var(--danger-bg)',color:'var(--danger)',fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:'.9rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all .18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='var(--danger)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='var(--danger-bg)'; e.currentTarget.style.color='var(--danger)'; }}>
              🚪 Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Avatar ── */
function UserAvatar({ user, size=34 }) {
  const nom=`${user?.prenom||''} ${user?.nom||''}`.trim()||'U';
  const initials=nom.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const colors={ admin:'#7C2D12,#B45309', professeur:'#065F46,#047857', étudiant:'#00153D,#1E3A8A' };
  const [a,b]=(colors[user?.role]||'#00153D,#1E3A8A').split(',');
  return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:`linear-gradient(135deg,${a},${b})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.33,fontWeight:900,color:'#fff',flexShrink:0,fontFamily:'Cabinet Grotesk,sans-serif',boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
      {initials}
    </div>
  );
}

/* ════════════════════════════════════════════════
   LAYOUT PRINCIPAL
════════════════════════════════════════════════ */
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const navItems         = NAV[user?.role]||NAV['étudiant'];
  const [dark, setDark]  = useDarkMode();
  const [notifOpen, setNotifOpen]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifSound, setNotifSound]     = useState(()=>{ try { return localStorage.getItem('edumatch_notif_sound')!=='false'; } catch { return true; } });
  const [chatResaId, setChatResaId]     = useState(null);
  const [openResaId, setOpenResaId]     = useState(null);

  const { notifs, unread, markAllRead, markOneRead, refresh, msgUnread } = useNotifications(user);

  useEffect(()=>{ injectLayoutCSS(); },[]);
  useEffect(()=>{ refresh(); },[location.pathname]);
  useEffect(()=>{ try { localStorage.setItem('edumatch_notif_sound', notifSound?'true':'false'); } catch {} },[notifSound]);

  function handleLogout()     { logout(); navigate('/login'); }
  function handleNotifOpen()  { setNotifOpen(p=>!p); setSettingsOpen(false); if(!notifOpen) markAllRead(); }
  function handleSettingsOpen(){ setSettingsOpen(p=>!p); setNotifOpen(false); }
  function handleOpenChat(resaId) {
    setChatResaId(resaId);
    navigate(user?.role==='professeur'?'/prof':'/reservations');
    setNotifOpen(false);
  }

  function handleOpenResa(resaId) {
    // Ouvre la modal de réservation depuis une notification pending
    setOpenResaId(resaId);
    navigate(user?.role==='professeur'?'/prof':'/reservations');
    setNotifOpen(false);
  }

  const currentLabel = navItems.find(n=>n.path===location.pathname)?.label||'EduMatch';
  const roleLabel    = { admin:'Administration', professeur:'Espace Professeur', étudiant:'Espace Étudiant' }[user?.role]||'EduMatch';

  return (
    <div className="ly-wrap">

      {/* ── SIDEBAR ── */}
      <aside className="ly-sidebar">

        {/* Logo */}
        <div style={{ padding:'22px 22px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:`1.5px solid var(--border)`,flexShrink:0 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#00153D,#1E3A8A)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(0,21,61,0.25)' }}>
            <span style={{ fontSize:'1.2rem' }}>🎓</span>
          </div>
          <div>
            <div style={{ fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'1.3rem',color:'var(--accent)',letterSpacing:'-.03em',lineHeight:1 }}>EduMatch</div>
            <div style={{ fontSize:'.6rem',fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginTop:1 }}>{roleLabel}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1,padding:'14px 12px',display:'flex',flexDirection:'column',gap:3,overflowY:'auto' }}>
          {navItems.map((item,i)=>{
            const active = location.pathname===item.path;
            const showMsgBadge = item.path==='/prof'&&user?.role==='professeur'&&msgUnread>0;
            return (
              <div key={item.path} className={`nav-item${active?' active':''}`}
                onClick={()=>navigate(item.path)}
                style={{ animationName:'slideIn',animationDuration:'.3s',animationTimingFunction:'ease',animationFillMode:'both',animationDelay:`${i*40}ms` }}>
                {active&&<div style={{ position:'absolute',left:0,top:'15%',bottom:'15%',width:3,borderRadius:'0 3px 3px 0',background:'var(--accent)' }}/>}
                <span style={{ fontSize:'1.05rem',width:22,textAlign:'center',flexShrink:0 }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge&&<span style={{ background:'#00153D',color:'#fff',fontSize:'.6rem',fontWeight:900,padding:'2px 8px',borderRadius:20,fontFamily:'Cabinet Grotesk,sans-serif' }}>{item.badge}</span>}
                {showMsgBadge&&<span style={{ background:'#EF4444',color:'#fff',fontSize:'.6rem',fontWeight:900,padding:'2px 7px',borderRadius:20,minWidth:18,textAlign:'center',animation:'pulse-badge 2s infinite',fontFamily:'Cabinet Grotesk,sans-serif' }}>{msgUnread}</span>}
              </div>
            );
          })}
        </nav>

        {/* ─── Bas de sidebar : user + déconnexion ─── */}
        <div style={{ padding:'12px 12px 16px',borderTop:`1.5px solid var(--border)`,display:'flex',flexDirection:'column',gap:8,flexShrink:0 }}>
          {/* User info */}
          <div style={{ display:'flex',alignItems:'center',gap:11,padding:'10px 12px',background:'var(--surface2)',borderRadius:12,border:`1.5px solid var(--border2)` }}>
            <UserAvatar user={user} size={36}/>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:'.86rem',color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.prenom} {user?.nom}</div>
              <div style={{ fontSize:'.68rem',color:'var(--text3)',textTransform:'capitalize',fontWeight:600,marginTop:1 }}>{user?.role}</div>
            </div>
          </div>

          {/* Bouton déconnexion rouge */}
          <button className="logout-btn-sidebar" onClick={handleLogout}>
            <span style={{ fontSize:'1rem' }}>🚪</span>
            <span style={{ flex:1 }}>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* ── ZONE DROITE ── */}
      <div className="ly-right">

        {/* Topbar */}
        <div className="ly-topbar">
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:3,height:20,background:`linear-gradient(180deg,var(--accent),var(--accent2))`,borderRadius:2 }}/>
            <span style={{ fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'1.05rem',color:'var(--text)',letterSpacing:'-.02em' }}>{currentLabel}</span>
          </div>

          <div style={{ display:'flex',alignItems:'center',gap:8 }}>

            {/* Mode sombre */}
            <button className={`topbar-btn${dark?' active':''}`} onClick={()=>setDark(d=>!d)} title={dark?'Mode clair':'Mode sombre'} style={{ fontSize:'1.1rem' }}>
              {dark?'☀️':'🌙'}
            </button>

            {/* Notifications */}
            <div style={{ position:'relative' }}>
              <button className={`topbar-btn${notifOpen?' active':''}`} onClick={handleNotifOpen} title="Notifications" style={{ position:'relative' }}>
                <span style={{ fontSize:'1.05rem' }}>🔔</span>
                {unread>0&&(
                  <span style={{ position:'absolute',top:-5,right:-5,background:'#EF4444',color:'#fff',fontSize:'.58rem',fontWeight:900,padding:'1px 5px',borderRadius:20,minWidth:17,textAlign:'center',lineHeight:'14px',border:`2px solid var(--topbar-bg)`,animation:'pulse-badge 2s infinite' }}>
                    {unread>9?'9+':unread}
                  </span>
                )}
              </button>
              {notifOpen&&(
                <NotificationPanel
                  notifs={notifs} unread={unread}
                  onMarkAllRead={markAllRead}
                  onMarkOneRead={markOneRead}
                  onNavigate={navigate}
                  onClose={()=>setNotifOpen(false)}
                  onOpenChat={handleOpenChat}
                  onOpenResa={handleOpenResa}
                />
              )}
            </div>

            {/* Paramètres */}
            <div style={{ position:'relative' }}>
              <button className={`topbar-btn${settingsOpen?' active':''}`} onClick={handleSettingsOpen} title="Paramètres">
                <span style={{ fontSize:'1rem' }}>⚙️</span>
              </button>
              {settingsOpen&&(
                <SettingsPanel
                  onClose={()=>setSettingsOpen(false)}
                  dark={dark} setDark={setDark}
                  notifSound={notifSound} setNotifSound={setNotifSound}
                  user={user}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Avatar → profil */}
            <div style={{ display:'flex',alignItems:'center',gap:9,padding:'6px 12px 6px 8px',background:'var(--surface2)',borderRadius:12,border:`1.5px solid var(--border2)`,cursor:'pointer',transition:'all .18s' }}
              onClick={()=>navigate('/profil')}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--nav-active-border)'; e.currentTarget.style.background='var(--nav-active-bg)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='var(--surface2)'; }}>
              <UserAvatar user={user} size={28}/>
              <span style={{ fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:'.84rem',color:'var(--text)' }}>{user?.prenom}</span>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="ly-content">
          <Outlet context={{ chatResaId, setChatResaId, openResaId, setOpenResaId }}/>
        </div>
      </div>
    </div>
  );
}