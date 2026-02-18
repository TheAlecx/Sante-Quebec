"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-slate-500">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Reessayer
        </button>
      </div>
    </div>
  );
}
