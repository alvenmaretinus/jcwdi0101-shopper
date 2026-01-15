import { Router } from "express";

const router = Router();

// TODO: Use isSuperAdmin for some routes

router.get("/", async (req, res) => {
  return res.json({ message: "Employee route works!" });
});

export default router;
