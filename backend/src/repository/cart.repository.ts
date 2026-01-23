import { prisma } from "../lib/db/prisma";

  export class CartRepository {
 
  static findCartByUserAndStore = async (userId: string, storeId: string) => {
    return prisma.cart.findUnique({ where: { userId_storeId: { userId, storeId } } });
  };

  static createCart = async (userId: string, storeId: string) => {
    return prisma.cart.create({ data: { userId, storeId } });
  };

 
  static findCartItem = async (cartId: string, productId: string) => {
    return prisma.cartItem.findFirst({ where: { cartId, productId } });
  };

  
  static findCartItemsByCartId = async (cartId: string) => {
    return prisma.cartItem.findMany({ where: { cartId } });
  };

 
static findCartWithItems = async (userId: string, storeId: string) => {
  return prisma.cart.findUnique({
    where: { userId_storeId: { userId, storeId } },
    include: { cartItems: true }, 
  });
};

static findCartWithItemsAndProduct = async (userId: string, storeId: string) => {
  return prisma.cart.findUnique({
    where: { userId_storeId: { userId, storeId } },
    include: { 
      cartItems: { 
        include: { product: true } 
      } 
    },
  });
};
  
  static createCartItem = async (data: { cartId: string; productId: string; productName: string; quantity: number }) => {
    return prisma.cartItem.create({ data });
  };

 
  static incrementCartItemQuantity = async (id: string, by: number) => {
    return prisma.cartItem.update({ where: { id }, data: { quantity: { increment: by } } });
  };

  
  static updateCartItemQuantity = async (id: string, quantity: number) => {
    return prisma.cartItem.update({ where: { id }, data: { quantity } });
  };

  
  static deleteCartItem = async (id: string) => {
    return prisma.cartItem.delete({ where: { id } });
  };
}
  

