import Link from 'next/link';

const promises = [
  'Only approved videos appear in the viewer experience.',
  'Viewer search stays inside the approved library.',
  'Parent approval controls which profiles get each video.',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-10 text-[#17212b]">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#315ef6]">WatchNest MVP</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Parent-curated video. Child-safe independence.
          </h1>
          <p className="mt-6 text-xl leading-8 text-[#607083]">
            WatchNest gives parents a simple way to approve individual YouTube videos and assign them to child profiles. Viewers only see what was explicitly approved for them.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="rounded-2xl bg-[#315ef6] px-6 py-4 text-center font-semibold text-white" href="/parent/dashboard">
              Open Parent Dashboard
            </Link>
            <Link className="rounded-2xl border border-[#c9d8f2] bg-white px-6 py-4 text-center font-semibold text-[#315ef6]" href="/watch">
              Open Viewer Mode
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[2rem] border border-[#d9e2ec] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#607083]">Profile</p>
              <h2 className="text-2xl font-bold">Emma&apos;s Videos</h2>
            </div>
            <div className="h-14 w-14 rounded-full bg-[#f8d7da]" />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-[#d9e2ec] bg-[#f8fbff] p-4">
              <div className="mb-3 h-28 rounded-2xl bg-[#ddeaf6]" />
              <p className="font-semibold">Bluey: Keepy Uppy</p>
              <p className="text-sm text-[#607083]">Approved for Emma</p>
            </div>
            <div className="rounded-3xl border border-[#d9e2ec] bg-[#f8fbff] p-4">
              <div className="mb-3 h-28 rounded-2xl bg-[#d8f3dc]" />
              <p className="font-semibold">Science Volcano</p>
              <p className="text-sm text-[#607083]">Approved for Emma</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">
        {promises.map((promise) => (
          <div key={promise} className="rounded-3xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold">{promise}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
