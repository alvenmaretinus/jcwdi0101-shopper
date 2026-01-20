import { Router } from "express";
import { isAuth } from "../middleware/isAuth";
import { AuthService } from "../service/auth.service";
import { SignupSchema } from "../schema/auth/SignupSchema";

const router = Router();

router.get("/session", isAuth, async (req, res) => {
  const user = await AuthService.getSession(req, res);
  return res.json(user);
});

router.post("/signup", async (req, res) => {
  const inputData = SignupSchema.parse(req.body);
  await AuthService.signup(inputData);
  return res.status(201).send();
});

export default router;
