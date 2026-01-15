import {Request, Response} from 'express';
import { UsersRepo } from '../db/users/interface';

export class UsersController { 
    private usersRepo: UsersRepo;
    
    constructor(usersRepo: UsersRepo) {
        this.usersRepo = usersRepo;
    }

    async CreateUser(req: Request, res: Response): Promise<void> {
        try {
            const { name, email } = req.body;
            // TODO: Do validation
            const newUser = await this.usersRepo.CreateUser({ name, email });

            // TODO: Do proper JSON
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}