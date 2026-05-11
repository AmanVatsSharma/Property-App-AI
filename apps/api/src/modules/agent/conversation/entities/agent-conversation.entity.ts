/**
 * @file agent-conversation.entity.ts
 * @module agent/conversation
 * @description TypeORM entity for persisted agent chat sessions.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

@ObjectType()
@Entity('agent_conversation')
export class AgentConversation {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @Field(() => GraphQLJSON, { description: 'Conversation messages as JSON array' })
  @Column({ type: 'simple-json', default: [] })
  messages: ConversationMessage[];

  @Field(() => String, { nullable: true, description: 'Full-text concatenation of all message content for search' })
  @Column({ type: 'text', nullable: true })
  search: string | null;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ type: 'boolean', default: false })
  archived: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
