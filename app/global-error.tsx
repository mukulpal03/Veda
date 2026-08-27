"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 mb-4">{error?.message || "An unexpected error occurred."}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#FF5623] hover:bg-[#e04513] text-white font-medium rounded-full transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
