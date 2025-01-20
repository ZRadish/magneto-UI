import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET; // Secret key from .env

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Get token from header
  const token = authHeader && authHeader.split(' ')[1]; // Extract token (Bearer <token>)

  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token
    req.user = decoded; // Attach the decoded payload (user info) to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};