// src/@types/express/index.d.ts
import UserModel  from "../../models/user/user.model"

declare global {
    namespace Express {
        interface Request {
            user?: UserModel;
        }
    }
}