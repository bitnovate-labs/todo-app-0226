/**
 * Screen Orientation API type. Browsers may not include `lock` in the
 * standard ScreenOrientation type even when supported (e.g. Android).
 */
export type OrientationAPI = ScreenOrientation & {
  lock?(mode: 'portrait' | 'portrait-primary'): Promise<void>;
};
