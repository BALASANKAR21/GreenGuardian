import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        uid: string;
        email: string;
        role: 'user' | 'admin';
    };
}
export declare class UserController {
    private userService;
    constructor();
    createUser(req: Request, res: Response): Promise<void>;
    getUser(req: Request, res: Response): Promise<void>;
    updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
    uploadProfilePicture(req: any, res: Response): Promise<void>;
}
export {};
