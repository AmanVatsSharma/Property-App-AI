/**
 * @file agent-conversation.entity.ts
 * @module agent/conversation
 * @description TypeORM entity for persisted agent chat sessions.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { JsonScalar } from '@api/shared/scalars/json.scalar';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

@ObjectType()
@Entity('agent_conversation')
export class AgentConversation {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @Field(() => JsonScalar)
  @Column({ type: 'jsonb', default: () => "'[]'" })
  messages: ConversationMessage[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
