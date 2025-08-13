import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { config } from 'dotenv';

import { authRoutes } from './routes/auth.routes';
import { adminRoutes } from './routes/admin.routes';
import { tenantRoutes } from './routes/tenant.routes';
import { uploadRoutes } from './routes/upload.routes';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';

config();

const app = express();

// Configurações básicas de segurança
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por windowMs
});

app.use(limiter);

// Rotas públicas
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminRoutes);

// Middleware de autenticação para rotas protegidas
app.use('/api', authenticateToken);

// Middleware de tenant para rotas protegidas
app.use('/api', tenantMiddleware);

// Rotas protegidas por tenant
app.use('/api/tenant', tenantRoutes);
app.use('/api/upload', uploadRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});