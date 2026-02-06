import { Router } from "express";
import { ShippingCostService } from "../service/shipping-cost.service";
import { GetShippingCostSchema } from "../schema/shipping-cost/GetShippingCostSchema";
import { isAuth } from "../middleware/isAuth";

const router = Router();

router.get("/", isAuth, async (req, res) => {
  const { originPostCode, destinationPostCode, weight, itemValue } = req.query;
  const inputData = GetShippingCostSchema.parse({
    originPostCode,
    destinationPostCode,
    weight,
    itemValue,
  });
  const result = await ShippingCostService.getShippingCost(inputData);

  return res.json(result);
});

export default router;
