import { UserDocument } from "../interfaces/user.interface"
declare global {
    namespace Express {
        interface User extends UserDocument {
            id?: string
        }
        interface Request {
            user?: User
            file: Express.Multer.File,
            originalUrl: string,
            rawBody: any
        }
    }
    interface Error {
        status?: number
        message?: string
    }
}