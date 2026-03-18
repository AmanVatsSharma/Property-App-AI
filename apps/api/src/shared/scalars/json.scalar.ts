/**
 * @file json.scalar.ts
 * @module shared/scalars
 * @description GraphQL JSON scalar (graphql-type-json) for code-first schema.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

@Scalar('JSON', () => Object)
export class JsonScalar implements CustomScalar<unknown, unknown> {
  description = GraphQLJSON.description ?? 'JSON value';

  serialize(value: unknown): unknown {
    return GraphQLJSON.serialize(value);
  }

  parseValue(value: unknown): unknown {
    return GraphQLJSON.parseValue(value);
  }

  parseLiteral(ast: { kind: string; value?: string }): unknown {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value ?? 'null');
      } catch {
        return ast.value;
      }
    }
    return GraphQLJSON.parseLiteral?.(ast as never, {} as never) ?? null;
  }
}
