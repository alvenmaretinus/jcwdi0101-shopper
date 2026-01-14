import { Router } from "express";
import { FindStoreByIdSchema } from "../schema/store/FindStoreByIdSchema";
import { findStores } from "../service/store/findStores";
import { findStoreById } from "../service/store/findStoreById";
import { addStore } from "../service/store/addStore";
import { AddStoreSchema } from "../schema/store/AddStoreSchema";

const router = Router();

// TODO: Use isSuperAdmin for some routes

router.get("/", async (req, res) => {
  const result = await findStores();
  return res.json({ result });
});

router.get("/:id", async (req, res) => {
  const FindStoreByIdData = FindStoreByIdSchema.parse(req.params);
  const result = await findStoreById(FindStoreByIdData);
  return res.json({ result });
});

router.post("/", async (req, res) => {
  const AddStoreData = AddStoreSchema.parse(req.body);
  const result = await addStore(AddStoreData);
  return res.json({ result });
});

export default router;
