export default function WeekLoading() {
  return (
    <div className="min-w-0 animate-pulse space-y-4">
      <div className="h-8 w-32 rounded-lg bg-gray-200" />
      <div className="h-4 w-48 rounded bg-gray-100" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-lg bg-gray-200" />
        <div className="h-10 flex-1 rounded-lg bg-gray-100" />
      </div>
      <div className="space-y-4">
        <div className="h-40 rounded-xl bg-gray-100" />
        <div className="h-40 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
