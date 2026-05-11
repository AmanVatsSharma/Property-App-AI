/**
 * @file agent-conversation.repository.ts
 * @module agent/conversation
 * @description Data access for AgentConversation entity.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentConversation, type ConversationMessage } from '../entities/agent-conversation.entity';

@Injectable()
export class AgentConversationRepository {
  constructor(
    @InjectRepository(AgentConversation)
    private readonly repo: Repository<AgentConversation>,
  ) {}

  async findById(id: string): Promise<AgentConversation | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUserId(userId: string, includeArchived = false): Promise<AgentConversation[]> {
    if (includeArchived) {
      return this.repo.find({ where: { userId }, order: { updatedAt: 'DESC' } });
    }
    return this.repo.find({ where: { userId, archived: false }, order: { updatedAt: 'DESC' } });
  }

  async create(userId: string | null, title?: string | null): Promise<AgentConversation> {
    const entity = this.repo.create({ userId, title: title ?? null, messages: [] });
    return this.repo.save(entity);
  }

  async appendMessages(id: string, newMessages: ConversationMessage[]): Promise<AgentConversation | null> {
    const conv = await this.repo.findOne({ where: { id } });
    if (!conv) return null;
    const current = Array.isArray(conv.messages) ? conv.messages : [];
    conv.messages = [...current, ...newMessages];
    conv.search = conv.messages.map((m) => `${m.role}: ${m.content}`).join('\n');
    return this.repo.save(conv);
  }

  async archive(id: string, archived = true): Promise<AgentConversation | null> {
    const conv = await this.repo.findOne({ where: { id } });
    if (!conv) return null;
    conv.archived = archived;
    return this.repo.save(conv);
  }

  async searchByContent(userId: string, query: string, limit = 20): Promise<AgentConversation[]> {
    return this.repo
      .createQueryBuilder('c')
      .where('c."userId" = :userId', { userId })
      .andWhere('c.search ILIKE :q', { q: `%${query}%` })
      .andWhere('c.archived = false')
      .orderBy('c.updatedAt', 'DESC')
      .take(limit)
      .getMany();
  }
}
