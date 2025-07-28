import { Request, Response, NextFunction } from 'express';
import HttpStatusCode from 'http-status-codes';
import { UserRole, isDoctor, isPatient } from '../interfaces/user.interface';

/**
 * Middleware to require specific roles
 */
export const requireRole = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        
        if (!user) {
            return res.status(HttpStatusCode.UNAUTHORIZED).send({
                status: false,
                message: 'User not authenticated',
            });
        }

        if (!roles.includes(user.role)) {
            return res.status(HttpStatusCode.FORBIDDEN).send({
                status: false,
                message: 'Insufficient permissions',
            });
        }

        next();
    };
};

/**
 * Middleware to require doctor role
 */
export const requireDoctor = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
        return res.status(HttpStatusCode.UNAUTHORIZED).send({
            status: false,
            message: 'User not authenticated',
        });
    }

    if (!isDoctor(user)) {
        return res.status(HttpStatusCode.FORBIDDEN).send({
            status: false,
            message: 'Access restricted to doctors only',
        });
    }

    next();
};

/**
 * Middleware to require patient role
 */
export const requirePatient = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
        return res.status(HttpStatusCode.UNAUTHORIZED).send({
            status: false,
            message: 'User not authenticated',
        });
    }

    if (!isPatient(user)) {
        return res.status(HttpStatusCode.FORBIDDEN).send({
            status: false,
            message: 'Access restricted to patients only',
        });
    }

    next();
};

/**
 * Middleware to check if user is doctor (for backward compatibility)
 */
export const requireDoctorLegacy = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
        return res.status(HttpStatusCode.UNAUTHORIZED).send({
            status: false,
            message: 'User not authenticated',
        });
    }

    // Check both new role system and legacy isDoctor field
    const isUserDoctor = user.role === UserRole.DOCTOR || user.isDoctor === true;
    
    if (!isUserDoctor) {
        return res.status(HttpStatusCode.FORBIDDEN).send({
            status: false,
            message: 'Access restricted to doctors only',
        });
    }

    next();
};

/**
 * Middleware to check if user is patient (for backward compatibility)
 */
export const requirePatientLegacy = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
        return res.status(HttpStatusCode.UNAUTHORIZED).send({
            status: false,
            message: 'User not authenticated',
        });
    }

    // Check both new role system and legacy isDoctor field
    const isUserPatient = user.role === UserRole.PATIENT || user.isDoctor === false;
    
    if (!isUserPatient) {
        return res.status(HttpStatusCode.FORBIDDEN).send({
            status: false,
            message: 'Access restricted to patients only',
        });
    }

    next();
}; 