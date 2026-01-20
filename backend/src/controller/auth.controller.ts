import { Router } from "express";
import { AuthService } from "../service/auth.service";

const router = Router();

router.get("/session", async (req, res) => {
  const user = await AuthService.getSession(req, res);
  return res.json(user);
});

export default router;
