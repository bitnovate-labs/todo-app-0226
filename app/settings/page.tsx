"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Type,
  MessageCircle,
  LogOut,
  Mail,
} from "lucide-react";
import { FeedbackDrawer } from "@/components/feedback/FeedbackDrawer";
import { SignOutForm } from "@/components/auth/SignOutForm";
import { LockRotationSetting } from "@/components/settings/LockRotationSetting";
import { WeekStartSetting } from "@/components/settings/WeekStartSetting";
import { WeekViewLayoutSetting } from "@/components/settings/WeekViewLayoutSetting";
import { CalendarViewSetting } from "@/components/settings/CalendarViewSetting";
import { ListFontSizeSetting } from "@/components/settings/ListFontSizeSetting";
import { SettingsSection } from "@/components/settings/SettingsSection";
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="min-w-0 px-2 pb-10 pt-2">
      <div className="space-y-6">
        <SettingsSection title="Account" icon={<Mail className="h-3.5 w-3.5" />}>
          <div>
            <p className="text-xs font-medium text-gray-500">Email</p>
            <p className="mt-0.5 break-all text-sm font-medium text-gray-900">
              {user.email ?? ""}
            </p>
          </div>
        </SettingsSection>

        <SettingsSection title="Calendar" icon={<Calendar className="h-3.5 w-3.5" />}>
          <div className="space-y-6">
            <WeekStartSetting />
            <WeekViewLayoutSetting />
            <CalendarViewSetting />
          </div>
        </SettingsSection>

        <SettingsSection title="Appearance" icon={<Type className="h-3.5 w-3.5" />}>
          <ListFontSizeSetting />
        </SettingsSection>

        <LockRotationSetting />

        <SettingsSection
          title="Feedback"
          icon={<MessageCircle className="h-3.5 w-3.5" />}
        >
          <p className="mb-3 text-sm text-gray-600">
            Help us improve by sharing your experience.
          </p>
          <FeedbackDrawer />
        </SettingsSection>

        <SettingsSection title="Sign out" icon={<LogOut className="h-3.5 w-3.5" />}>
          <SignOutForm />
        </SettingsSection>
      </div>
    </div>
  );
}
