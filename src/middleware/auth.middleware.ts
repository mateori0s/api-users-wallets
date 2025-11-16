import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { isTokenBlacklisted } from '../utils/token-blacklist.util';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token || token.trim() === '') {
      res.status(401).json({ 
        success: false,
        error: 'Token is required' 
      });
      return;
    }

    // Check if token is blacklisted (invalidated)
    if (isTokenBlacklisted(token)) {
      res.status(401).json({ 
        success: false,
        error: 'Token has been invalidated. Please sign in again.' 
      });
      return;
    }

    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
      return;
    }
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
    return;
  }
};

