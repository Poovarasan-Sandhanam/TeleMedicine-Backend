// src/@types/express/index.d.ts
import { UserProfileDocument } from "../../models/user/user.model.ts"

declare global {
    namespace Express {
        interface Request {
            user?: UserProfileDocument;
        }
    }
}