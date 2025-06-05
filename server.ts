import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://saitayme.github.io', 'https://www.saitayme.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (process.env.NODE_ENV === 'development') {
    console.log('Request headers:', req.headers);
  }
  next();
});

// Log environment status
console.log('Server environment:', {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: port,
  corsOrigins: corsOptions.origin
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
}); 