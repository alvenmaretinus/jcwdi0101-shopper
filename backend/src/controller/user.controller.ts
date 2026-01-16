import { UserService } from "../service/user.service";
import { Router } from "express";
import { Request, Response } from 'express';
import { prisma } from '../lib/db/prisma';
import { PostgresRepository as UsersRepository } from "../repository/user/adapter_prisma_postgresql";

const usersRepo = new UsersRepository(prisma);
const userService = new UserService(usersRepo);

const router = Router();

router.post("/user", (req: Request, res: Response) => {
    userService.CreateUser(req, res);
});

router.get("/user/:id", (req: Request, res: Response) => {
    userService.GetUserByID(req, res);
});

router.get("/users", (req: Request, res: Response) => {
    userService.GetUsersByFilter(req, res);
});

router.patch("/user/:id", (req: Request, res: Response) => {
    userService.UpdateUser(req, res);
});


export default router;
