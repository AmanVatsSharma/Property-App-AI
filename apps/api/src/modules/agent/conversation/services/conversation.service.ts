/**
 * @file conversation.service.ts
 * @module agent/conversation
 * @description Persist and resume agent chat sessions.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { AgentConversation, type ConversationMessage } from '../entities/agent-conversation.entity';
import { AgentConversationRepository } from '../repository/agent-conversation.repository';

@Injectable()
export class ConversationService {
  constructor(private readonly repo: AgentConversationRepository) {}

  async startConversation(userId: string | null): Promise<AgentConversation> {
    return this.repo.create(userId, null);
  }

  async appendMessages(id: string, messages: ConversationMessage[]): Promise<AgentConversation | null> {
    return this.repo.appendMessages(id, messages);
  }

  async getConversation(id: string): Promise<AgentConversation | null> {
    return this.repo.findById(id);
  }

  async myConversations(userId: string): Promise<AgentConversation[]> {
    return this.repo.findByUserId(userId);
  }
}
