import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite chaque IP à 5 requêtes par fenêtre
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
}); 