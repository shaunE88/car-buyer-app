import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import researchRoutes from './routes/research.js';
import testDriveRoutes from './routes/testDrive.js';
import negotiationRoutes from './routes/negotiation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));

// API Routes
app.use('/api/research', researchRoutes);
app.use('/api/test-drive', testDriveRoutes);
app.use('/api/negotiation', negotiationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚗 Car Buyer Assistant running on http://localhost:${PORT}`);
});
