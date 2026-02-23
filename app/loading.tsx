export default function Loading() {
  return (
    <div className="min-w-0 animate-pulse space-y-4">
      <div className="h-8 w-24 rounded-lg bg-gray-200" />
      <div className="h-4 w-32 rounded bg-gray-100" />
      <div className="space-y-2 pt-4">
        <div className="h-14 rounded-xl bg-gray-100" />
        <div className="h-14 rounded-xl bg-gray-100" />
        <div className="h-14 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
