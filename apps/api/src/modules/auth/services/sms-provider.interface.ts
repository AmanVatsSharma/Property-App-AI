/**
 * @file sms-provider.interface.ts
 * @module auth
 * @description Interface for sending SMS (OTP); implementations: stub, Twilio, MSG91.
 * @author BharatERP
 * @created 2025-03-13
 */

export interface ISmsProvider {
  send(phone: string, message: string): Promise<void>;
}
