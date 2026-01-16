import {Request, Response} from 'express';
import { UsersRepo } from '../repository/user/interface';
import { CreateUserReq } from '../repository/user/entities';
import { UserRole } from '../../prisma/generated/client';

export class UserService { 
    private usersRepo: UsersRepo;
    
    constructor(usersRepo: UsersRepo) {
        this.usersRepo = usersRepo;
    }

    async CreateUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, role, profileUrl, createdAt, updatedAt, referralCode, storeId } = req.body;
            // TODO: Do validation

            let userRole = role as UserRole

            if (userRole === UserRole.ADMIN && !(req.user?.role as UserRole === UserRole.SUPERADMIN)) {
                res.status(403).json({ error: 'Only Super Admins can create Admin users' });
                return;
            }

            const createUserReq: CreateUserReq = { 
                email: email,
                role: userRole,
                profileUrl: profileUrl,
                createdAt: createdAt,
                updatedAt: updatedAt,
                referralCode: referralCode,
                storeId: storeId
             };
            const newUser = await this.usersRepo.CreateUser(createUserReq);

            // TODO: Do proper JSON
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async GetUserByID(req: Request, res: Response): Promise<void> {
        const userId = req.params.id;
        this.usersRepo.GetUsersByFilter({ id: userId }).then((users) => {
            if (users.length === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.status(200).json(users[0]);
            }
        }).catch((error) => {
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }


    async GetUsersByFilter(req: Request, res: Response): Promise<void> {
        this.usersRepo.GetUsersByFilter({}).then((users) => {
            res.status(200).json(users);
        }).catch((error) => {
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }

    async UpdateUser(req: Request, res: Response): Promise<void> {
        try {
            // TODO: Validate String
            const userId = req.params.id as string;
            const createUserReq: Partial<CreateUserReq> = req.body;

            await this.usersRepo.GetUsersByFilter({ id: userId }).then((users) => {
                if (users.length === 0) {
                    res.status(404).json({ error: 'User not found' });
                    throw new Error('User not found');
                }
                if (users[0].role === UserRole.ADMIN && !(req.user?.role as UserRole === UserRole.SUPERADMIN)) {
                    res.status(403).json({ error: 'Only Super Admins can update Admin users' });
                    throw new Error('Forbidden');
                }
            });

            const updatedUser = await this.usersRepo.UpdateUser(userId, createUserReq);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
