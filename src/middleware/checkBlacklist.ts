import { Request, Response, NextFunction } from 'express';
import { isTokenBlacklisted } from '../utilities/tokenBlacklist';

const checkBlacklist = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token is blacklisted' });
  }
  next();
};

export default checkBlacklist;
