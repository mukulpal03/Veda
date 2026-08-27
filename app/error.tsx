"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans bg-gray-50">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-sm text-gray-600 mb-4 max-w-md">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="px-4 py-2 bg-[#1E1E1E] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
