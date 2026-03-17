/**
 * @file agent-rate-limit.guard.ts
 * @module common/guards
 * @description Per-IP rate limit for agent mutations (askAgent, scoreProperty). Uses Redis when REDIS_URL set, else in-memory.
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
import { AgentRateLimitStore } from '@api/common/guards/agent-rate-limit.store';

@Injectable()
export class AgentRateLimitGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly store: AgentRateLimitStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limit = this.config.get<number>('AGENT_RATE_LIMIT_PER_MIN') ?? 10;
    const type = context.getType<string>();
    const req =
      type === 'http'
        ? context.switchToHttp().getRequest<{ ip?: string; socket?: { remoteAddress?: string } }>()
        : GqlExecutionContext.create(context).getContext().req;
    const ip = req?.ip ?? req?.socket?.remoteAddress ?? 'unknown';
    const allowed = await this.store.incrementAndCheck(ip, limit);
    if (!allowed) {
      throw new HttpException('Agent rate limit exceeded. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
