/**
 * @file copy.ts
 * @module admin/lib
 * @description Centralised user-facing copy for the admin panel.
 *   All labels, messages, errors, and button text must be defined here — no hardcoded
 *   strings in components. This module is the i18n foundation: replace values with
 *   a t() translation function when multi-locale support is added.
 * @author BharatERP
 * @created 2026-03-26
 */

export const COPY = {
  auth: {
    title: 'Admin sign in',
    phonePlaceholder: '10-digit mobile',
    phoneLabel: 'Phone',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending…',
    otpCodeLabel: 'OTP code',
    otpCodePlaceholder: '6-digit code',
    verify: 'Verify',
    verifying: 'Verifying…',
    changeNumber: 'Change number',
    codeSentTo: (phone: string) => `Code sent to ${phone}`,
    errorInvalidPhone: 'Enter a valid 10-digit Indian mobile number',
    errorInvalidOtp: 'Enter the 6-digit code',
    errorSendFailed: 'Failed to send OTP',
    errorVerifyFailed: 'Invalid or expired OTP',
    errorAccessDenied: 'Access denied. Admin only.',
  },
  nav: {
    dashboard: 'Dashboard',
    properties: 'Properties',
    users: 'Users',
    signOut: 'Sign out',
  },
  dashboard: {
    title: 'Dashboard',
    statsProperties: 'Total Properties',
    statsUsers: 'Total Users',
    loading: 'Loading stats…',
  },
  properties: {
    title: 'Properties',
    newProperty: 'New property',
    noResults: 'No properties found.',
    deleteConfirm: 'Delete this property?',
    deleteSuccess: 'Property deleted.',
    deleteError: 'Failed to delete property.',
  },
  users: {
    title: 'Users',
    noResults: 'No users found.',
    roleUpdated: 'Role updated.',
    roleUpdateError: 'Failed to update role.',
  },
  guard: {
    loading: 'Loading…',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
  },
} as const;
