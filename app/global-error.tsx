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
      <body>
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Something went wrong</h2>
          <p>{error?.message || "An unexpected error occurred"}</p>
          <button type="button" onClick={() => reset()} style={{ padding: "8px 16px", marginTop: "12px" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
