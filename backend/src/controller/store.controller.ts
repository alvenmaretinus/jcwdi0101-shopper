import { Router } from "express";
import { StoreService } from "../service/store.service";
import { GetStoreByIdSchema } from "../schema/store/GetStoreByIdSchema";
import { CreateStoreSchema } from "../schema/store/CreateStoreSchema";
import { UpdateStoreSchema } from "../schema/store/UpdateStoreSchema";
import { DeleteStoreByIdSchema } from "../schema/store/DeleteStoreByIdSchema";
import { AddEmployeeSchema } from "../schema/store/AddEmployeeSchema";
import { RemoveEmployeeSchema } from "../schema/store/RemoveEmployeeSchema";

const router = Router();

// TODO: Use isSuperAdmin for some routes

router.get("/", async (req, res) => {
  const result = await StoreService.getStoresWithEmployeeCount();
  return res.json(result);
});

router.get("/products", async (req, res) => {
  const result = await StoreService.getStoresWithProducts();
  return res.json(result);
});

router.get("/:id", async (req, res) => {
  const inputData = GetStoreByIdSchema.parse(req.params);
  const result = await StoreService.getStoreById(inputData);
  return res.json(result);
});

router.get("/:id/employees/", async (req, res) => {
  const inputData = GetStoreByIdSchema.parse(req.params);
  const result = await StoreService.getStoreByIdWithEmployee(inputData);
  return res.json(result);
});

router.post("/", async (req, res) => {
  const inputData = CreateStoreSchema.parse(req.body);
  const result = await StoreService.createStore(inputData);
  return res.json(result);
});

router.patch("/:id", async (req, res) => {
  const inputData = UpdateStoreSchema.parse({
    ...req.params,
    ...req.body,
  });
  const result = await StoreService.updateStore(inputData);
  return res.json(result);
});

router.delete("/:id", async (req, res) => {
  const inputData = DeleteStoreByIdSchema.parse(req.params);
  const result = await StoreService.deleteStoreById(inputData);
  return res.json(result);
});

router.patch("/:id/employees/", async (req, res) => {
  const inputData = AddEmployeeSchema.parse({ ...req.body, ...req.params });
  const result = await StoreService.addEmployee(inputData);
  return res.json(result);
});

router.delete("/:id/employees/:employeeId", async (req, res) => {
  const inputData = RemoveEmployeeSchema.parse(req.params);
  const result = await StoreService.removeEmployee(inputData);
  return res.json(result);
});

export default router;
