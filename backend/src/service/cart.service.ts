import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";

export class CartService {
  static async addToCart(userId: string, storeId: string, productId: string, quantity: number) {
    const cart = (await CartRepository.findCartByUserAndStore(userId, storeId)) || (await CartRepository.createCart(userId, storeId));
    const existing = await CartRepository.findCartItem(cart.id, productId);
    const requestedQuantity = existing ? existing.quantity + quantity : quantity;
    const productStock = await prisma.productStore.findUnique({
      where: { productId_storeId: { productId, storeId } },
      select: { quantity: true },
    });
    if (!productStock) {
      throw new BadRequestError("Product not found in the specified store.");
    }
    if (productStock.quantity < requestedQuantity) {
      throw new BadRequestError("Insufficient stock for this product.");
    }
    if (existing) {
      return CartRepository.incrementCartItemQuantity(existing.id, quantity);
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });
    if (quantity <= 0) {
      throw new BadRequestError("Quantity must be greater than zero.");
    }
    return CartRepository.createCartItem({
      cartId: cart.id,
      productId,
      productName: product?.name ?? "",
      quantity,
    });
  }

  static async getCart(userId: string, storeId: string) {
    const cartWithItems = await CartRepository.findCartWithItemsAndProduct(userId, storeId);
    if (!cartWithItems) {
      return { cartItems: [] };
    }
    const enrichedItems = await Promise.all(
      cartWithItems.cartItems.map(async (item) => {
        const productStock = await prisma.productStore.findUnique({
          where: { productId_storeId: { productId: item.productId, storeId } },
          select: { quantity: true },
        });

        const stockQty = productStock?.quantity ?? 0;
        return {
          ...item,
          stockQuantity: stockQty,
          outOfStock: stockQty <= 0,
          canAddToCart: stockQty > 0,
        };
      }),
    );
    return enrichedItems;
  }

  static async updateCartItemQuantity(userId: string, storeId: string, productId: string, quantity: number) {
    const cart = await CartRepository.findCartByUserAndStore(userId, storeId);
    if (!cart) {
      throw new BadRequestError("Cart not found.");
    }

    const cartItem = await CartRepository.findCartItem(cart.id, productId);
    if (!cartItem) {
      throw new BadRequestError("Cart item not found.");
    }

    if (quantity <= 0) {
      return CartRepository.deleteCartItem(cartItem.id);
    }

    const productStock = await prisma.productStore.findUnique({
      where: { productId_storeId: { productId, storeId } },
      select: { quantity: true },
    });

    if (!productStock || productStock.quantity < quantity) {
      throw new BadRequestError("Insufficient stock for this product.");
    }

    return CartRepository.updateCartItemQuantity(cartItem.id, quantity);
  }

  static async deleteCartItem(userId: string, storeId: string, productId: string) {
    const cart = await CartRepository.findCartByUserAndStore(userId, storeId);
    if (!cart) {
      throw new BadRequestError("Cart not found.");
    }

    const cartItem = await CartRepository.findCartItem(cart.id, productId);
    if (!cartItem) {
      throw new BadRequestError("Cart item not found.");
    }

    return CartRepository.deleteCartItem(cartItem.id);
  }
}
