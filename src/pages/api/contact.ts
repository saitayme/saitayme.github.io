import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import { verify } from 'hcaptcha';

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: import.meta.env.VITE_EMAIL_USER,
    pass: import.meta.env.VITE_EMAIL_PASS
  }
});

// Input validation
const validateInput = (data: any) => {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.length < 2 || data.name.length > 50) {
    errors.push('Name must be between 2 and 50 characters');
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }
  }

  // Subject validation
  if (!data.subject || typeof data.subject !== 'string') {
    errors.push('Subject is required');
  } else if (data.subject.length < 3 || data.subject.length > 100) {
    errors.push('Subject must be between 3 and 100 characters');
  }

  // Message validation
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required');
  } else if (data.message.length < 10 || data.message.length > 1000) {
    errors.push('Message must be between 10 and 1000 characters');
  }

  // Check for potential spam patterns
  const spamPatterns = [
    /viagra/i,
    /casino/i,
    /lottery/i,
    /bitcoin/i,
    /crypto/i,
    /http:\/\//i,
    /https:\/\//i,
    /www\./i,
    /\[url/i,
    /\[link/i
  ];

  const containsSpam = spamPatterns.some(pattern => 
    pattern.test(data.message) || pattern.test(data.subject)
  );

  if (containsSpam) {
    errors.push('Message contains potential spam content');
  }

  return errors;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await new Promise((resolve, reject) => {
      limiter(req, res, (result: any) => {
        if (result instanceof Error) return reject(result);
        return resolve(result);
      });
    });

    const { name, email, subject, message, captchaToken } = req.body;

    // Validate CAPTCHA
    if (!captchaToken) {
      return res.status(400).json({ message: 'CAPTCHA verification required' });
    }

    try {
      const captchaResponse = await verify(import.meta.env.VITE_RECAPTCHA_SECRET_KEY || '', captchaToken);
      if (!captchaResponse.success) {
        return res.status(400).json({ message: 'CAPTCHA verification failed' });
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      return res.status(500).json({ message: 'Error verifying CAPTCHA' });
    }

    // Validate input
    const validationErrors = validateInput({ name, email, subject, message });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Send email
    await transporter.sendMail({
      from: import.meta.env.VITE_EMAIL_USER,
      to: import.meta.env.VITE_EMAIL_USER, // Send to yourself
      replyTo: email, // Allow direct replies to the sender
      subject: `Portfolio Contact: ${subject}`,
      text: `
New Contact Form Submission
--------------------------
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Sent from: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}
User Agent: ${req.headers['user-agent']}
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #f07e41; border-bottom: 2px solid #f07e41; padding-bottom: 10px;">
    New Contact Form Submission
  </h2>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
  </div>

  <div style="background: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd;">
    <h3 style="color: #333; margin-top: 0;">Message:</h3>
    <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
  </div>

  <div style="font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
    <p><strong>Sent from:</strong> ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}</p>
    <p><strong>User Agent:</strong> ${req.headers['user-agent']}</p>
  </div>
</div>
      `
    });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
} 