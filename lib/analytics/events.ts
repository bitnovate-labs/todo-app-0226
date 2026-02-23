/**
 * PostHog event names and payload types for the MVP.
 * Use trackEvent() from ./track with these event names.
 */

export const ANALYTICS_EVENTS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  WELCOME_PAGE_VIEW: 'welcome_page_view',
  WELCOME_STEPS_COMPLETED: 'welcome_steps_completed',
  WELCOME_STEPS_SKIPPED: 'welcome_steps_skipped',
  PWA_INSTALL_VIEWED: 'pwa_install_viewed',
  PWA_INSTALL_INSTALLED: 'pwa_install_installed',
  PWA_INSTALL_DISMISSED: 'pwa_install_dismissed',
  FEEDBACK_CLICKED: 'feedback_clicked',
  FEEDBACK_VIEWED: 'feedback_viewed',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  APP_OPENED: 'app_opened',
  TIME_ON_PAGE: 'time_on_page',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_FAILED: 'checkout_failed',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  SUBSCRIPTION_COMPLETED: 'subscription_completed',
  HOME_VIEWED: 'home_viewed',
  PROFILE_VIEWED: 'profile_viewed',
  ERROR_OCCURRED: 'error_occurred',
  ANALYTICS_CONSENT_ACCEPTED: 'analytics_consent_accepted',
  ANALYTICS_CONSENT_DECLINED: 'analytics_consent_declined',
  RESET_PASSWORD_REQUEST: 'reset_password_request',
  UPDATE_PASSWORD_SUBMIT: 'update_password_submit',
} as const;

/** User properties set via posthog.identify(userId, traits) */
export type UserTraits = {
  email?: string;
  signup_date?: string; // ISO date
  onboarding_completed?: boolean;
  subscription_status?: string;
  created_at?: string; // ISO datetime
  plan_type?: string;
};

/** Event payloads for type-safe tracking */
export type AnalyticsEventPayload =
  | { name: typeof ANALYTICS_EVENTS.ONBOARDING_COMPLETED }
  | { name: typeof ANALYTICS_EVENTS.USER_SIGNED_UP }
  | { name: typeof ANALYTICS_EVENTS.USER_SIGNED_IN }
  | { name: typeof ANALYTICS_EVENTS.USER_SIGNED_OUT }
  | { name: typeof ANALYTICS_EVENTS.WELCOME_PAGE_VIEW }
  | { name: typeof ANALYTICS_EVENTS.WELCOME_STEPS_COMPLETED }
  | { name: typeof ANALYTICS_EVENTS.WELCOME_STEPS_SKIPPED }
  | { name: typeof ANALYTICS_EVENTS.PWA_INSTALL_VIEWED }
  | { name: typeof ANALYTICS_EVENTS.PWA_INSTALL_INSTALLED }
  | { name: typeof ANALYTICS_EVENTS.PWA_INSTALL_DISMISSED }
  | { name: typeof ANALYTICS_EVENTS.FEEDBACK_CLICKED }
  | { name: typeof ANALYTICS_EVENTS.FEEDBACK_VIEWED }
  | { name: typeof ANALYTICS_EVENTS.FEEDBACK_SUBMITTED }
  | { name: typeof ANALYTICS_EVENTS.SESSION_START; path?: string }
  | { name: typeof ANALYTICS_EVENTS.SESSION_END; path?: string; seconds_in_session?: number }
  | { name: typeof ANALYTICS_EVENTS.APP_OPENED }
  | { name: typeof ANALYTICS_EVENTS.TIME_ON_PAGE; path: string; seconds: number }
  | { name: typeof ANALYTICS_EVENTS.CHECKOUT_STARTED; [key: string]: unknown }
  | { name: typeof ANALYTICS_EVENTS.CHECKOUT_FAILED; reason?: string; [key: string]: unknown }
  | { name: typeof ANALYTICS_EVENTS.PAYMENT_SUCCESS; [key: string]: unknown }
  | { name: typeof ANALYTICS_EVENTS.PAYMENT_FAILED; reason?: string; [key: string]: unknown }
  | { name: typeof ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED; [key: string]: unknown }
  | { name: typeof ANALYTICS_EVENTS.HOME_VIEWED }
  | { name: typeof ANALYTICS_EVENTS.PROFILE_VIEWED }
  | { name: typeof ANALYTICS_EVENTS.ERROR_OCCURRED; message?: string; context?: string; [key: string]: unknown }
  | { name: typeof ANALYTICS_EVENTS.ANALYTICS_CONSENT_ACCEPTED }
  | { name: typeof ANALYTICS_EVENTS.ANALYTICS_CONSENT_DECLINED }
  | { name: typeof ANALYTICS_EVENTS.RESET_PASSWORD_REQUEST }
  | { name: typeof ANALYTICS_EVENTS.UPDATE_PASSWORD_SUBMIT };
