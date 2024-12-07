import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import agentRoutes from './routes/agent.routes';
import listingRoutes from './routes/listing.routes';
import { InitService } from './services/init.service';

const app = express();

// Middleware de base
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/listings', listingRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 3001;

// Démarrage du serveur
const startServer = async () => {
  try {
    await InitService.initializeSuperAdmin();
    console.log('Super admin initialisé avec succès');

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`URL Frontend: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();
