/**
 * @file public.decorator.ts
 * @module common/decorators
 * @description Marks routes as public (skip AuthGuard when applied globally).
 * @author BharatERP
 * @created 2025-03-10
 */

import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@api/common/guards/auth.guard';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
