"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="glass-card p-8 sm:p-12 text-center max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something Went Wrong</h2>
        <p className="text-white/60 mb-6 text-sm">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
