import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy',
  description: 'Privacy and analytics notice for ' + APP_NAME,
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-xl font-semibold tracking-tight text-gray-900">Privacy</h1>
      <p className="text-gray-600">
        This app respects your privacy. Below is a short summary of how we handle data and analytics.
      </p>

      <h2 className="mt-4 text-base font-semibold text-gray-900">Account and auth</h2>
      <p className="text-gray-600">
        We use Supabase for authentication. Your email and account data are stored securely and are not shared with third parties for marketing.
      </p>

      <h2 className="mt-4 text-base font-semibold text-gray-900">Analytics and consent</h2>
      <p className="text-gray-600">
        We use PostHog to understand how the app is used (e.g. page views, sign-in, feedback, and time spent). This helps us improve the product and fix friction. We do not use this data for advertising or sell it to third parties.
      </p>
      <p className="mt-2 text-gray-600">
        When you first use the app, you can <strong>Accept</strong> or <strong>Decline</strong> analytics. If you accept, we record events (such as &quot;user_signed_in&quot;, &quot;feedback_submitted&quot;) and optional session recordings to improve the experience. If you decline, we do not track. The app works the same either way.
      </p>

      <h2 className="mt-4 text-base font-semibold text-gray-900">Your choices</h2>
      <p className="text-gray-600">
        You can change or withdraw analytics consent by clearing site data or cookies for this app, then choosing again when the consent banner appears.
      </p>

      <p className="mt-6 text-sm text-gray-500">
        For full terms and data handling, contact the app owner. Last updated: 2025.
      </p>

      <p className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
