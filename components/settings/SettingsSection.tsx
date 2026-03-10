"use client";

type SettingsSectionProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white shadow-md">
      <div className="border-b border-gray-100 px-3 py-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {icon}
          {title}
        </h2>
      </div>
      <div className="px-3 py-4">{children}</div>
    </section>
  );
}
