import { Router } from "express";
import { UserAddressService } from "../service/user-address.service";
import { CreateUserAddressSchema } from "../schema/user-address/CreateUserAddressSchema";
import { UpdateUserAddressSchema } from "../schema/user-address/UpdateUserAddressSchema";
import { UserAddressIdSchema } from "../schema/user-address/UserAddressIdSchema";
import { isAuth } from "../middleware/isAuth";

const router = Router();

router.use(isAuth);

router.get("/", async (req, res) => {
  const user = req.user!
  const result = await UserAddressService.getAddressesByUserId(user.id);
  return res.json(result);
});

router.get("/:id", async (req, res) => {
    const id=req.params.id;
    const inputData = UserAddressIdSchema.parse({id});
    const result = await UserAddressService.getAddressById(inputData);
    return res.json(result);
});

router.post("/", async (req, res) => {
  const user= req.user!
  console.log(user)
  const inputData = CreateUserAddressSchema.parse({
    ...req.body,
    userId: user.id,
  });
  const result = await UserAddressService.createAddress(inputData);
  return res.json(result);
});

router.patch("/:id", async (req, res) => {
  const user= req.user!
  const id=req.params.id;
  const inputData = UpdateUserAddressSchema.parse({
    ...req.body,
    userId:user.id,
    id,
  });
  const result = await UserAddressService.updateAddress(user.id, inputData);
  return res.json(result);
});

router.delete("/:id", async (req, res) => {
  const user= req.user!
  const id=req.params.id;
  const inputData = UserAddressIdSchema.parse({id});
  const result = await UserAddressService.deleteAddress(user.id, inputData);
  return res.json(result);
});

export default router;