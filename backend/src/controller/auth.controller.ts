import { Router } from "express";
import { AuthService } from "../service/auth.service";
import { SignupSchema } from "../schema/auth/SignupSchema";
import { CallbackSchema } from "../schema/auth/CallbackSchema";
import { isAuth } from "../middleware/isAuth";
import { LoginSchema } from "../schema/auth/LoginSchema";

const router = Router();

router.get("/session", isAuth, async (req, res) => {
  const user=req.user!
  return res.json(user);
});

router.post("/signup", async (req, res) => {
  const inputData = SignupSchema.parse(req.body);
  await AuthService.signup(inputData);
  return res.status(201).send();
});

router.post("/login", async (req, res) => {
  const inputData = LoginSchema.parse(req.body);
  await AuthService.login(inputData, res);
  return res.status(200).send();
});

router.post("/refresh", async (req, res) => {
  await AuthService.refresh(req, res);
  return res.status(200).send();
});

router.post("/callback", async (req, res) => {
  const inputData = CallbackSchema.parse(req.body);
  await AuthService.callback(inputData, res);
  return res.status(200).send();
});

export default router;
