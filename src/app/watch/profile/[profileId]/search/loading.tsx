import { LoadingState } from '@/components/ui/states';

export default function ViewerLibrarySearchLoading() {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <LoadingState title="Loading viewer search" description="Preparing the approved library search." />
      </div>
    </main>
  );
}
