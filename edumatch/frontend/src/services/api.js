import axios from 'axios';

// Avec le proxy Vite, baseURL est vide — les appels /api/... passent par Vite
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json'
  },
});

// ── Intercepteur request : injecte le token JWT ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ── Intercepteur response : gestion 401 + 403 COMPTE_BLOQUE ──────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;

    // ── 401 : token expiré ou invalide → déconnexion silencieuse ──
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }

    // ── 403 COMPTE_BLOQUE : compte suspendu détecté via API ───────
    // (peut survenir lors d'une vérification périodique ou d'un appel API)
    if (status === 403 && detail?.code === 'COMPTE_BLOQUE') {
      const raison = detail.raison || "Votre compte a été suspendu par l'administration.";

      // Stocker la raison pour l'afficher sur la page login
      try {
        sessionStorage.setItem('compte_bloque_raison', raison);
      } catch {}

      // Ne pas boucler si on est déjà sur login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?bloque=1';
      }
      return Promise.reject(err);
    }

    return Promise.reject(err);
  }
);

export default api;