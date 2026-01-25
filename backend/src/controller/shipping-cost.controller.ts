import { Router } from "express";
import { ShippingCostService } from "../service/shipping-cost.service";
import { GetShippingCostSchema } from "../schema/shipping-cost/GetShippingCostSchema";

const router = Router();

router.get("/", async (req, res) => {
  const { originPostCode, destinationPostCode, weight, itemValue } = req.query;
  const inputData=GetShippingCostSchema.parse({
  originPostCode,
  destinationPostCode,  
  weight: Number(weight),
  itemValue: Number(itemValue),
})
  const result = await ShippingCostService.getShippingCost(inputData);

  return res.json(result);
});

export default router;
