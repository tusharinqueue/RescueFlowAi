export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-card">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading RescueFlowAI…</p>
      </div>
    </div>
  );
}
