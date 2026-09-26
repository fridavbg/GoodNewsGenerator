import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search';

dotenv.config();

const requiredEnvVars = ['ANTHROPIC_API_KEY', 'NEWS_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('📝 Copy .env.example to .env and fill in your API keys');
  process.exit(1);
}

console.log('✅ Environment variables validated');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/api', searchRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
