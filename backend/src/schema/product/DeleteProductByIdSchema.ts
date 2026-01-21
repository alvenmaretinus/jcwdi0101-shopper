import { z } from 'zod';
import {ProductByIdSchema} from './ProductByIdSchema';

export const GetProductByIdSchema = ProductByIdSchema

export type GetProductByIdInput = z.infer<typeof GetProductByIdSchema>;