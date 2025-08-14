import { Request, Response, NextFunction } from 'express';
import HttpStatusCode from 'http-status-codes';
import { verifyToken } from '../utilities/jwt';
import userModel from '../models/user/user.model';
import { UserDocument } from '../interfaces/user.interface';

interface JwtPayload {
  id: string;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // ✅ Only pass the token, since verifyToken accepts 1 argument
      const decoded = verifyToken(token) as JwtPayload;

      if (!decoded?.id) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          status: false,
          message: 'Invalid token payload',
        });
      }

      const user: UserDocument | null = await userModel.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          status: false,
          message: 'User not found',
        });
      }

      // Attach user object to request
      (req as any).user = user;

      next();
    } catch (error) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        status: false,
        message: 'Not authorized, token failed',
        error: error instanceof Error ? error.message : error
      });
    }
  } else {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      status: false,
      message: 'Not authorized, no token provided',
    });
  }
};

export default auth;
