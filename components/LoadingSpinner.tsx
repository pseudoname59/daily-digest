export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" suppressHydrationWarning></div>
        <p className="text-gray-600" suppressHydrationWarning>{message}</p>
      </div>
    </div>
  );
}
