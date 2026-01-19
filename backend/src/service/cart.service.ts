import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";



export class CartService {

   static async addToCart(userId: string, storeId: string, productId: string, quantity = 1){
    const cart = (await CartRepository.findCartByUserAndStore(userId, storeId)) || (await CartRepository.createCart(userId, storeId));
    const existing = await CartRepository.findCartItem(cart.id, productId);
    if (existing) return CartRepository.incrementCartItemQuantity(existing.id, quantity);
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } });
    return CartRepository.createCartItem({ cartId: cart.id, productId, productName: product?.name ?? "", quantity });
  };
}
