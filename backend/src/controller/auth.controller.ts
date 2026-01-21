import { Router } from "express";
import { AuthService } from "../service/auth.service";
import { SignupSchema } from "../schema/auth/SignupSchema";
import { CallbackSchema } from "../schema/auth/CallbackSchema";

const router = Router();

router.get("/session", async (req, res) => {
  const user = await AuthService.getSession(req, res);
  return res.json(user);
});

router.post("/signup", async (req, res) => {
  const inputData = SignupSchema.parse(req.body);
  await AuthService.signup(inputData);
  return res.status(201).send();
});

router.post("/callback", async (req, res) => {
  const inputData = CallbackSchema.parse(req.body);
  await AuthService.callback(inputData, res);
  return res.status(200).send();
});

export default router;
