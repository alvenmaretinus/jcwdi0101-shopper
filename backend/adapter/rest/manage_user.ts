import { UsersController } from "../../services/v1/controllers/UsersController";
import app from "../../src/index";
import { Request, Response } from 'express';
import { prisma } from '../../src/lib/db/prisma';
import { PostgresRepository as UsersRepository } from "../../services/v1/db/users/adapter_prisma_postgresql";

const usersRepo = new UsersRepository(prisma);
const userController = new UsersController(usersRepo);
app.post("/user", (req: Request, res: Response) => {
    userController.CreateUser(req, res);
});
