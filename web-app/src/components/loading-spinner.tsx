export default function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-light border-t-transparent" />
        <p className="text-sm text-slate-500">Chargement...</p>
      </div>
    </div>
  );
}
