import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";
import { PricingCalculationService } from "./pricing-calculation.service";

export class CartService {
  private static async getOrCreateCart(userId: string) {
    const cart = await CartRepository.findCartByUser(userId);
    if (cart) return cart;
    return CartRepository.createCart(userId);
  }

  private static ensurePositiveQuantity(quantity: number) {
    if (quantity > 0) return;
    throw new BadRequestError("Quantity must be greater than zero.");
  }

  private static async getProductTotalStock(productId: string) {
    const productStores = await prisma.productStore.findMany({ where: { productId }, select: { quantity: true } });
    return productStores.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }

  private static validateStockAvailability(productTotal: number, requestedQuantity: number) {
    if (productTotal <= 0) throw new BadRequestError("Product not found in any store.");
    if (productTotal < requestedQuantity) throw new BadRequestError("Insufficient total stock for this product.");
  }

  private static async buildCartPricing(
    userId: string,
    subtotal: number,
    discountIds?: string[],
    voucherIds?: string[]
  ) {
    const totalDiscount = await PricingCalculationService.calculateTotalDiscount(subtotal, discountIds, voucherIds, prisma, userId);
    const shippingCost = 0;
    return { subtotal, totalDiscount, shippingCost, grandTotal: subtotal - totalDiscount + shippingCost };
  }

  private static async mapCartItem(item: any, recommendedStoreId?: string) {
    const productStores = await prisma.productStore.findMany({ where: { productId: item.productId }, select: { quantity: true, storeId: true } });
    const productTotal = productStores.reduce((sum, entry) => sum + (entry.quantity ?? 0), 0);
    const stockQty = recommendedStoreId ? (productStores.find((entry) => entry.storeId === recommendedStoreId)?.quantity ?? 0) : 0;
    const product = item.product as any;
    const image = product?.productImages?.length > 0 ? product.productImages[0].url : null;
    return { id: item.id, productId: item.productId, quantity: item.quantity, name: product?.name ?? null, price: product?.price ?? null, image, unit: "item", stockQuantity: stockQty, productTotal, outOfStock: stockQty <= 0, canAddToCart: stockQty > 0 };
  }

  private static async getCartItemOrThrow(cartId: string, productId: string) {
    const cartItem = await CartRepository.findCartItem(cartId, productId);
    if (!cartItem) throw new BadRequestError("Cart item not found.");
    return cartItem;
  }

  private static async getUserCartOrThrow(userId: string) {
    const cart = await CartRepository.findCartByUser(userId);
    if (!cart) throw new BadRequestError("Cart not found.");
    return cart;
  }

  static async addToCart(userId: string, productId: string, quantity: number) {
    this.ensurePositiveQuantity(quantity);
    const cart = await this.getOrCreateCart(userId);
    const existing = await CartRepository.findCartItem(cart.id, productId);
    const requestedQuantity = existing ? existing.quantity + quantity : quantity;
    const productTotal = await this.getProductTotalStock(productId);
    this.validateStockAvailability(productTotal, requestedQuantity);
    if (existing) return CartRepository.incrementCartItemQuantity(existing.id, quantity);
    await prisma.product.findUnique({ where: { id: productId }, select: { name: true } });
    return CartRepository.createCartItem({ cartId: cart.id, productId, quantity });
  }

  static async getCart(userId: string, recommendedStoreId?: string, discountIds?: string[], voucherIds?: string[]) {
    const cartWithItems = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cartWithItems) {
      return { cartId: null, cartItems: [], pricing: { subtotal: 0, totalDiscount: 0, shippingCost: 0, grandTotal: 0 } };
    }
    const subtotal = cartWithItems.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const pricing = await this.buildCartPricing(userId, subtotal, discountIds, voucherIds);
    const enrichedItems = await Promise.all(cartWithItems.cartItems.map((item) => this.mapCartItem(item, recommendedStoreId)));
    return {
      cartId: cartWithItems.id,
      cartItems: enrichedItems,
      pricing,
    };
  }

  static async updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.getUserCartOrThrow(userId);
    const cartItem = await this.getCartItemOrThrow(cart.id, productId);
    if (quantity <= 0) return CartRepository.deleteCartItem(cartItem.id);
    const productTotal = await this.getProductTotalStock(productId);
    if (productTotal < quantity) throw new BadRequestError("Insufficient total stock for this product.");
    return CartRepository.updateCartItemQuantity(cartItem.id, quantity);
  }

  static async deleteCartItem(userId: string, productId: string) {
    const cart = await this.getUserCartOrThrow(userId);
    const cartItem = await this.getCartItemOrThrow(cart.id, productId);
    return CartRepository.deleteCartItem(cartItem.id);
  }
}
