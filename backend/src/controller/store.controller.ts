import { CreateStoreSchema } from "../schema/store/CreateStoreSchema";
import { Router } from "express";
import { StoreService } from "../service/store.service";
import { GetStoreByIdSchema } from "../schema/store/GetStoreByIdSchema";

const router = Router();

// TODO: Use isSuperAdmin for some routes

router.get("/", async (req, res) => {
  const result = await StoreService.getStores();
  return res.json({ result });
});

router.get("/:id", async (req, res) => {
  const getStoreByIdData = GetStoreByIdSchema.parse(req.params);
  const result = await StoreService.getStoreById(getStoreByIdData);
  return res.json({ result });
});

router.post("/", async (req, res) => {
  const createStoreData = CreateStoreSchema.parse(req.body);
  const result = await StoreService.createStore(createStoreData);
  return res.json({ result });
});

export default router;
