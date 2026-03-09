"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeedbackDrawer } from "@/components/feedback/FeedbackDrawer";
import { SignOutForm } from "@/components/auth/SignOutForm";
import { LockRotationSetting } from "@/components/settings/LockRotationSetting";
import { WeekStartSetting } from "@/components/settings/WeekStartSetting";
import { WeekViewLayoutSetting } from "@/components/settings/WeekViewLayoutSetting";
import { CalendarViewSetting } from "@/components/settings/CalendarViewSetting";
import { useUser } from "@/components/layout/UserContext";

export default function SettingsPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/sign-in?next=" + encodeURIComponent("/settings"));
    }
  }, [user, router]);

  if (user === null) {
    return (
      <div className="animate-page-load py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-w-0 text-center">
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-gray-900">
        Settings
      </h1>
      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-600">Email</p>
        <p className="break-all text-gray-900 sm:break-normal">{user.email ?? ""}</p>
      </div>

      <div className="mb-6 text-left">
        <WeekStartSetting />
      </div>

      <div className="mb-6 text-left">
        <WeekViewLayoutSetting />
      </div>

      <div className="mb-6 text-left">
        <CalendarViewSetting />
      </div>

      <div className="mb-6 text-left">
        <LockRotationSetting />
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
