import { Router } from 'express';
import { PrismaRepository }  from '../repository/discount/adapter_prisma';
import { prisma } from '../lib/db/prisma';
import { DiscountService } from '../service/discount/discount.service';
import { GetDiscountByIDSchema, GetDiscountByIDInput, GetDiscountsByFilterInput, GetDiscountsByFilterSchema, CreateDiscountInput, CreateDiscountSchema, UpdateDiscountSchema, UpdateDiscountInput} from '../schema/discount/';

const discountsRepo = new PrismaRepository(prisma);
const discountService = new DiscountService(discountsRepo);

const router = Router();

router.post("/", async (req, res) => {
    const inputData: GetDiscountsByFilterInput = GetDiscountsByFilterSchema.parse(req.body);
    const discounts = await discountService.getDiscountsByFilter(inputData); 
    return res.json(discounts);
}); 

router.post("/", async (req, res) => {
    const inputData: CreateDiscountInput = CreateDiscountSchema.parse(req.body);
    const discounts = await discountService.createDiscount(inputData); 
    return res.json(discounts);
});

router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const inputData: UpdateDiscountInput = UpdateDiscountSchema.parse({
        ...req.body,
        id: id,
    });
    
    const updatedDiscount = await discountService.updateDiscount(id, inputData); 
    return res.json(updatedDiscount);
});

router.delete("/:id", async (req, res) => {
    const inputData: GetDiscountByIDInput = GetDiscountByIDSchema.parse(req.params);
    await discountService.deleteDiscount(inputData.id); 
    return res.status(204).send();
});

router.get("/:id", async (req, res) => {
    const inputData: GetDiscountByIDInput = GetDiscountByIDSchema.parse(req.params);
    const discount = await discountService.getDiscountById(inputData.id); 
    if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
    } 
    return res.json(discount);
});  

export default router;