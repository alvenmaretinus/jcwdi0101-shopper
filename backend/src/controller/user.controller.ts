import { UserService } from "../service/user.service";
import { Router } from "express";
import { prisma } from '../lib/db/prisma';
import { PostgresRepository as UsersRepository } from "../repository/user/adapter_prisma";
import { isSuperAdmin } from "../middleware/isSuperAdmin";
import { isAuth } from "../middleware/isAuth";
import { CreateUserSchema } from "../schema/user/CreateUserSchema";
import { UpdateUserSchema } from "../schema/user/UpdateUserSchema";
import { GetUserByIdSchema } from "../schema/user/GetUserByIdSchema";

const usersRepo = new UsersRepository(prisma);
const userService = new UserService(usersRepo);

const router = Router();

router.post("/user", async (req, res) => {
    const inputData = CreateUserSchema.parse(req.body);
    const result = await userService.CreateUser(inputData, req.user);
    return res.status(201).json(result);
});

router.get("/user/:id", isAuth, async (req, res) => {
    const inputData = GetUserByIdSchema.parse(req.params);
    const result = await userService.GetUserByID(inputData.id);
    return res.json(result);
});

router.get("/users", isAuth, async (req, res) => {
    const result = await userService.GetUsersByFilter();
    return res.json(result);
});

router.patch("/user/:id", isAuth, async (req, res) => {
    const { id } = GetUserByIdSchema.parse(req.params);
    const inputData = UpdateUserSchema.parse(req.body);
    const result = await userService.UpdateUser(id, inputData, req.user);
    return res.json(result);
});

router.delete("/user/:id", isAuth, isSuperAdmin, async (req, res) => {
    const { id } = GetUserByIdSchema.parse(req.params);
    await userService.DeleteUser(id);
    return res.status(204).send();
});

export default router;
