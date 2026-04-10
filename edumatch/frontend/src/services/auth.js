import api from './api';

/**
 * CONNEXION
 */
export async function login(email, password) {
  // On envoie la requête au backend
  const { data } = await api.post('/api/auth/login', { email, password });
  
  // On stocke proprement le Token et l'objet User complet
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data.user;
}

/**
 * INSCRIPTION
 */
export async function register(payload) {
  // Le payload contient déjà nom, prenom, email, password, role, date_naissance
  const { data } = await api.post('/api/auth/register', payload);
  
  // On stocke les infos pour connecter l'utilisateur immédiatement
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data.user;
}

/**
 * DÉCONNEXION
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optionnel : on peut forcer un rechargement pour vider les états React
  window.location.href = '/login';
}

/**
 * RÉCUPÉRER L'UTILISATEUR ACTUEL
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Erreur de lecture du localStorage", error);
    return null;
  }
}

/**
 * VÉRIFIER SI CONNECTÉ
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token');
  // Vérifie si le token existe et n'est pas vide
  return !!token && token !== 'undefined';
}