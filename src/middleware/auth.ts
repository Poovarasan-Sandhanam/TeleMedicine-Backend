import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/user/user.model';
import path from "path"
import fs from "fs"
import HttpStatusCode from "http-status-codes"
import { verifyToken } from '../utilities/jwt'
interface JwtPayload {
    id: string;
}
const JWT_SECRET = fs.readFileSync(path.join(__dirname, "../../private.key"), "utf8")
const auth = async (req: Request, res: Response, next: NextFunction) => {

    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = verifyToken(token)
            let userDetails = await userModel.findById(decoded.id).select('-password') as UserProfileDocument;
            
            (req as any).user = await userModel.findById(decoded.id).select('-password') as UserProfileDocument;
            next();
        } catch (error) {
            return res.status(HttpStatusCode.UNAUTHORIZED).send({
                status: false,
                message: 'Not authorized, token failed',
            })
        }
    }

    if (!token) {
        return res.status(HttpStatusCode.UNAUTHORIZED).send({
            status: false,
            message: 'Not authorized, no token',
        })
    }

};

export default auth;