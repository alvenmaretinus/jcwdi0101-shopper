import { UserService } from "../service/user.service";
import { Router } from "express";
import { Request, Response } from 'express';
import { prisma } from '../lib/db/prisma';
import { PostgresRepository as UsersRepository } from "../repository/user/adapter_prisma_postgresql";
import { isSuperAdmin } from "../middleware/isSuperAdmin";
import { isAuth } from "../middleware/isAuth";

const usersRepo = new UsersRepository(prisma);
const userService = new UserService(usersRepo);

const router = Router();

router.post("/user", (req: Request, res: Response) => {
    userService.CreateUser(req, res);
});

router.get("/user/:id", isAuth, (req: Request, res: Response) => {
    userService.GetUserByID(req, res);
});

router.get("/users", isAuth, (req: Request, res: Response) => {
    userService.GetUsersByFilter(req, res);
});

router.patch("/user/:id", isAuth, (req: Request, res: Response) => {
    userService.UpdateUser(req, res);
});

router.delete("/user/:id", isAuth, isSuperAdmin, (req: Request, res: Response) => {
    userService.DeleteUser(req, res);
});

export default router;
