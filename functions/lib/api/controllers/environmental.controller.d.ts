import { Request, Response } from 'express';
export declare const environmentalController: {
    saveData(req: Request, res: Response): Promise<void>;
    getLatest(req: Request, res: Response): Promise<void>;
    getHistory(req: Request, res: Response): Promise<void>;
};
