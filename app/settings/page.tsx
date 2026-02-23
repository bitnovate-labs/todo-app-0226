import { requireUser } from "@/lib/auth";
import { FeedbackDrawer } from "@/components/feedback/FeedbackDrawer";
import { SignOutForm } from "@/components/auth/SignOutForm";
import { WeekStartSetting } from "@/components/settings/WeekStartSetting";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="min-w-0 text-center">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Settings</h1>
      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-600">Email</p>
        <p className="break-all text-gray-900 sm:break-normal">{user.email}</p>
      </div>

      <div className="mb-6 text-left">
        <WeekStartSetting />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <p className="mb-3 text-left text-sm text-gray-600">
          Help us improve by sharing your experience.
        </p>
        <div className="text-left">
          <FeedbackDrawer />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <SignOutForm />
      </div>
    </div>
  );
}
