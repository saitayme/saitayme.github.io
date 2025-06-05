import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { handleContactForm } from './contact';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers
  });
  next();
});

app.post('/api/contact', handleContactForm);

export default app; 