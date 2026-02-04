import {z} from 'zod';

/**
 * Internal schema for product store ID validation.
 * @internal - Only for use within the product schema package
 */
export const ProductStoreByIdSchema = z.strictObject({
  id: z.uuid("Invalid product store ID"),
});