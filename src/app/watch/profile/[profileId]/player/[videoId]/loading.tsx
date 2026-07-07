import { LoadingState } from '@/components/ui/states';

export default function ViewerPlayerLoading() {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-5xl">
        <LoadingState title="Loading approved video" description="Checking that this video belongs in this profile library." />
      </div>
    </main>
  );
}
