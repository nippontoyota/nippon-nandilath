export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-44 bg-gray-200 rounded-md" />
        <div className="h-4 w-72 max-w-full bg-gray-100 rounded-md" />
      </div>
      <div className="space-y-4">
        <div className="h-40 bg-white border border-gray-100 rounded-xl" />
        <div className="h-40 bg-white border border-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
