import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";

export class CartService {
  static async addToCart(userId: string, productId: string, quantity: number) {
    const cart = (await CartRepository.findCartByUser(userId)) || (await CartRepository.createCart(userId));
    const existing = await CartRepository.findCartItem(cart.id, productId);
    const requestedQuantity = existing ? existing.quantity + quantity : quantity;
    const productStores = await prisma.productStore.findMany({
      where: { productId },
      select: { quantity: true },
    });
    const productTotal = productStores.reduce((s, p) => s + (p.quantity ?? 0), 0);
    if (productTotal <= 0) {
      throw new BadRequestError("Product not found in any store.");
    }
    if (productTotal < requestedQuantity) {
      throw new BadRequestError("Insufficient total stock for this product.");
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

  static async getCart(userId: string, recommendedStoreId?: string) {
    const cartWithItems = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cartWithItems) {
      return { cartId: null, cartItems: [] };
    }
    const enrichedItems = await Promise.all(
      cartWithItems.cartItems.map(async (item) => {
        // get stock for the selected store and productTotal across all stores
        const productStores = await prisma.productStore.findMany({
          where: { productId: item.productId },
          select: { quantity: true, storeId: true },
        });

        const productTotal = productStores.reduce((s, p) => s + (p.quantity ?? 0), 0);
        const storeEntry = recommendedStoreId ? productStores.find((p) => p.storeId === recommendedStoreId) : undefined;
        const stockQty = storeEntry?.quantity ?? 0;

        return {
          ...item,
          stockQuantity: stockQty,
          productTotal,
          outOfStock: stockQty <= 0,
          canAddToCart: stockQty > 0,
        };
      }),
    );

    return {
      cartId: cartWithItems.id,
      cartItems: enrichedItems,
    };
  }

  static async updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await CartRepository.findCartByUser(userId);
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

    // validate against ProductTotal (sum across all stores) as cart-level limit
    const productStores = await prisma.productStore.findMany({ where: { productId }, select: { quantity: true } });
    const productTotal = productStores.reduce((s, p) => s + (p.quantity ?? 0), 0);
    if (productTotal < quantity) {
      throw new BadRequestError("Insufficient total stock for this product.");
    }

    return CartRepository.updateCartItemQuantity(cartItem.id, quantity);
  }

  static async deleteCartItem(userId: string, productId: string) {
    const cart = await CartRepository.findCartByUser(userId);
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
