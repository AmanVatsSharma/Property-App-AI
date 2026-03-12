/**
 * @file app.error.ts
 * @module common/errors
 * @description Base AppError and domain errors; extend for HTTP mapping in filter.
 * @author BharatERP
 * @created 2025-03-10
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class PropertyNotFoundError extends AppError {
  constructor(id: string) {
    super(`Property with id "${id}" not found`, 'PROPERTY_NOT_FOUND', 404);
    this.name = 'PropertyNotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AgentError extends AppError {
  constructor(message: string, statusCode: number = 503) {
    super(message, 'AGENT_ERROR', statusCode);
    this.name = 'AgentError';
  }
}

export class UserNotFoundError extends AppError {
  constructor(id: string) {
    super(`User with id "${id}" not found`, 'USER_NOT_FOUND', 404);
    this.name = 'UserNotFoundError';
  }
}

export class AreaNotFoundError extends AppError {
  constructor(id: string) {
    super(`Area with id "${id}" not found`, 'AREA_NOT_FOUND', 404);
    this.name = 'AreaNotFoundError';
  }
}
