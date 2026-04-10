import React, { useState } from 'react';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function Calendar({ available = [], booked = [], onSelect }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i - offset + 1);

  function isAvailable(d) { return available.includes(d); }
  function isBooked(d) { return booked.includes(d); }
  function isToday(d) { return d === today.getDate() && month === today.getMonth() && year === today.getFullYear(); }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', cursor: 'pointer' }}>‹</button>
        <div style={{ fontWeight: 600 }}>{MONTHS[month]} {year}</div>
        <button onClick={nextMonth} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', cursor: 'pointer' }}>›</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, fontSize: '.78rem', marginBottom: 12 }}>
        <span><span style={{ color: '#43e97b' }}>■</span> Disponible</span>
        <span><span style={{ color: '#ff6584' }}>■</span> Réservé</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', padding: '6px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const valid = d >= 1 && d <= daysInMonth;
          const av = valid && isAvailable(d);
          const bk = valid && isBooked(d);
          const td = valid && isToday(d);
          return (
            <div
              key={i}
              onClick={() => valid && av && onSelect && onSelect(new Date(year, month, d))}
              style={{
                aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, fontSize: '.82rem', cursor: valid && av ? 'pointer' : 'default',
                border: td ? '1px solid #6c63ff' : '1px solid transparent',
                background: !valid ? 'transparent' : av ? 'rgba(67,233,123,.1)' : bk ? 'rgba(255,101,132,.1)' : 'transparent',
                color: !valid ? 'transparent' : av ? '#43e97b' : bk ? 'var(--text2)' : 'var(--text)',
                transition: '.15s',
              }}
            >
              {valid ? d : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}
