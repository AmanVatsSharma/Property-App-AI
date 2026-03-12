/**
 * @file agent-rate-limit.guard.ts
 * @module common/guards
 * @description Per-IP rate limit for agent mutations (askAgent, scoreProperty). Uses AGENT_RATE_LIMIT_PER_MIN.
 * @author BharatERP
 * @created 2025-03-12
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';

interface Slot {
  count: number;
  resetAt: number;
}

const store = new Map<string, Slot>();
const TTL_MS = 60_000;

@Injectable()
export class AgentRateLimitGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const limit = this.config.get<number>('AGENT_RATE_LIMIT_PER_MIN') ?? 10;
    const type = context.getType<string>();
    const req =
      type === 'http'
        ? context.switchToHttp().getRequest<{ ip?: string; socket?: { remoteAddress?: string } }>()
        : GqlExecutionContext.create(context).getContext().req;
    const ip = req?.ip ?? req?.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();
    let slot = store.get(ip);
    if (!slot || now >= slot.resetAt) {
      slot = { count: 0, resetAt: now + TTL_MS };
      store.set(ip, slot);
    }
    slot.count += 1;
    if (slot.count > limit) {
      throw new HttpException('Agent rate limit exceeded. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
