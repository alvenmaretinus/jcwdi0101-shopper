import {z} from 'zod';

/**
 * Internal schema for product ID validation.
 * @internal - Only for use within the product schema package
 */
export const ProductByIdSchema = z.strictObject({
  id: z.uuid("Invalid product ID"),
});