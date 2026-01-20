import { Router } from "express";
import { isAuth } from "../middleware/isAuth";

const router = Router();

router.get("/session", isAuth, async (req, res) => {
  const session = req.user!;
  return res.json({ session });
});

export default router;
