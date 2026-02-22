import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";
import { PricingCalculationService } from "./pricing-calculation.service";

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
    await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });
    if (quantity <= 0) {
      throw new BadRequestError("Quantity must be greater than zero.");
    }
    return CartRepository.createCartItem({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  static async getCart(userId: string, recommendedStoreId?: string, discountIds?: string[], voucherIds?: string[]) {
    const cartWithItems = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cartWithItems) {
      return {
        cartId: null,
        cartItems: [],
        pricing: {
          subtotal: 0,
          totalDiscount: 0,
          productPromotionDiscount: 0,
          globalDiscount: 0,
          shippingCost: 0,
          grandTotal: 0,
        },
      };
    }

    // Calculate subtotal
    const subtotal = cartWithItems.cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const productPromotionBreakdown = await PricingCalculationService.calculateProductPromotionBreakdown(
      cartWithItems.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
      prisma,
    );
    const productPromotionDiscount = productPromotionBreakdown.totalDiscount;
    const subtotalAfterProductPromotion = Math.max(0, subtotal - productPromotionDiscount);

    const bogoFreeQuantityByProductId = new Map<string, number>();
    const productPromotionDiscountByProductId = new Map<string, number>();
    productPromotionBreakdown.lines.forEach((line) => {
      bogoFreeQuantityByProductId.set(line.productId, line.bogoFreeQuantity);
      productPromotionDiscountByProductId.set(line.productId, line.totalDiscount);
    });

    // Calculate total discount (discounts + vouchers)
    const cartItemsForDiscount = cartWithItems.cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const autoGlobalDiscountIds =
      await PricingCalculationService.getAutoAppliedGlobalDiscountIds(
        subtotalAfterProductPromotion,
        prisma,
      );
    const combinedDiscountIds = Array.from(
      new Set([...(discountIds ?? []), ...autoGlobalDiscountIds]),
    );

    const additionalDiscount = await PricingCalculationService.calculateTotalDiscount(
      subtotalAfterProductPromotion,
      combinedDiscountIds.length > 0 ? combinedDiscountIds : undefined,
      voucherIds,
      prisma,
      userId,
      0,
      cartItemsForDiscount,
    );
    const globalDiscount =
      autoGlobalDiscountIds.length > 0
        ? await PricingCalculationService.calculateTotalDiscount(
            subtotalAfterProductPromotion,
            autoGlobalDiscountIds,
            undefined,
            prisma,
            userId,
            0,
            cartItemsForDiscount,
          )
        : 0;
    const totalDiscount = productPromotionDiscount + additionalDiscount;

    // Shipping cost is estimated as 0 in cart (calculated during checkout)
    const shippingCost = 0;
    const grandTotal = subtotal - totalDiscount + shippingCost;

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

        const product = item.product as any;
        const image = product?.productImages && product.productImages.length > 0 ? product.productImages[0].url : null;
        const originalUnitPrice = product?.price ?? 0;
        const linePromotionDiscount =
          productPromotionDiscountByProductId.get(item.productId) ?? 0;
        const lineOriginalTotal = originalUnitPrice * item.quantity;
        const lineDiscountedTotal = Math.max(
          0,
          lineOriginalTotal - linePromotionDiscount,
        );
        const discountedUnitPrice =
          item.quantity > 0
            ? Math.round(lineDiscountedTotal / item.quantity)
            : originalUnitPrice;

        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          // expose product summary fields for frontend
          name: product?.name ?? null,
          price: originalUnitPrice,
          originalPrice: originalUnitPrice,
          discountedPrice: discountedUnitPrice,
          productPromotionDiscount: linePromotionDiscount,
          image,
          unit: "item",

          stockQuantity: stockQty,
          productTotal,
          outOfStock: stockQty <= 0,
          canAddToCart: stockQty > 0,
          bogoFreeQuantity: bogoFreeQuantityByProductId.get(item.productId) ?? 0,
        };
      }),
    );

    return {
      cartId: cartWithItems.id,
      cartItems: enrichedItems,
      pricing: {
        subtotal,
        totalDiscount,
        productPromotionDiscount,
        globalDiscount,
        shippingCost,
        grandTotal,
      },
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
