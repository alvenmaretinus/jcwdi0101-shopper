import { CreateStoreSchema } from "../schema/store/CreateStoreSchema";
import { Router } from "express";
import { StoreService } from "../service/store.service";

const router = Router();

router.post("/", async (req, res) => {
  const createStoreData = CreateStoreSchema.parse(req.body);
  const result = await StoreService.createStore(createStoreData);
  return res.json({ result });
});

export default router;
