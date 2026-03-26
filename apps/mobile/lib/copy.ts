/**
 * @file copy.ts
 * @module lib
 * @description Centralised user-facing copy for the mobile app.
 *   All labels, messages, errors, button text, and empty-state copy must be defined here.
 *   This module is the i18n foundation: replace values with a t() translation function
 *   (e.g. expo-localization + i18n-js) when multi-locale support is added.
 * @author BharatERP
 * @created 2026-03-26
 */

export const COPY = {
  tabs: {
    home: 'Home',
    search: 'Search',
    post: 'Post',
    saved: 'Saved',
    more: 'More',
  },
  favorites: {
    title: 'Saved',
    savedCount: (n: number) => `${n} saved propert${n === 1 ? 'y' : 'ies'}`,
    signInTitle: 'Sign in to view saved properties',
    signInSubtitle: 'Save properties while browsing to revisit them anytime.',
    signInCta: 'Sign In',
    emptyTitle: 'No saved properties yet',
    emptySubtitle: 'Tap the Save button on any property to keep it here for later.',
    browseCta: 'Browse Properties',
  },
  property: {
    backLabel: '← Back',
    saveLabel: '♡ Save',
    savedLabel: '❤️ Saved',
    shareLabel: '⤴ Share',
    enquireLabel: 'Enquire',
    notFoundTitle: 'Property not found',
    notFoundSubtitle: 'This property may have been removed or the link is incorrect.',
    notFoundCta: 'Go back',
    overviewTitle: 'Overview',
    contactTitle: 'Contact Owner',
    contactSubtitle: 'Get in touch for site visits and negotiations',
    callbackCta: '📞 Request Callback',
    messageCta: '💬 Send Message',
    aiScoreLabel: 'AI Score',
    enquiryModalTitle: 'Send enquiry',
    enquiryPlaceholder: 'Your message…',
    sendLabel: 'Send',
    sendingLabel: 'Sending…',
    enquirySentLabel: 'Enquiry sent.',
    cancelLabel: 'Cancel',
    projectLabel: 'Project',
    locationLabel: 'Location',
  },
  search: {
    placeholder: 'Search by city, locality, or ask AI…',
    noResults: 'No properties found. Try a different search.',
  },
  more: {
    title: 'More',
    signIn: 'Sign in',
    signInDesc: 'Sign in with mobile OTP',
  },
  comingSoon: {
    earlyAccessTitle: 'Get early access',
    earlyAccessSubtitle: 'Be the first to know when this feature launches.',
    emailPlaceholder: 'your@email.com',
    notifyCta: 'Notify me',
    notifySuccess: "✓ You're on the list! We'll notify you at launch.",
    invalidEmail: 'Please enter a valid email address.',
    invalidEmailTitle: 'Invalid email',
  },
  auth: {
    loginTitle: 'Welcome back',
    phoneLabel: 'Mobile number',
    phonePlaceholder: '+91 98765 43210',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending…',
    otpLabel: 'Enter OTP',
    otpPlaceholder: '6-digit code',
    verify: 'Verify',
    verifying: 'Verifying…',
    changeNumber: 'Change number',
    codeSentTo: (phone: string) => `OTP sent to ${phone}`,
    errorInvalidPhone: 'Enter a valid 10-digit mobile number',
    errorInvalidOtp: 'Enter the 6-digit code',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
  },
} as const;
