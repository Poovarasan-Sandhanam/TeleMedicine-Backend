import { NextFunction, Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';

/**
 * Per-user fixed-window limit, for endpoints that spend money (AI calls).
 * In-memory: correct for a single server instance. With several instances behind
 * a load balancer, move this to a shared store such as Redis.
 */
export const rateLimit = ({ windowMs, max }: { windowMs: number; max: number }) => {
    const hits = new Map<string, { count: number; resetAt: number }>();
    return (req: Request, res: Response, next: NextFunction) => {
        const key = String((req as any).user?._id ?? req.ip);
        const now = Date.now();
        const entry = hits.get(key);
        if (!entry || entry.resetAt <= now) {
            hits.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        if (entry.count >= max) {
            res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
            return res.status(HttpStatusCode.TOO_MANY_REQUESTS).json({
                status: false,
                message: 'Too many requests. Please wait a few minutes and try again.',
            });
        }
        entry.count += 1;
        return next();
    };
};
