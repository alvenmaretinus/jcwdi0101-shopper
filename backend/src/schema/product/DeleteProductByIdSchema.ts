import { z } from 'zod';
import {ProductByIdSchema} from './ProductByIdSchema';

export const DeleteProductByIdSchema = ProductByIdSchema;

export type DeleteProductByIdInput = z.infer<typeof DeleteProductByIdSchema>;