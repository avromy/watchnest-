import Link from 'next/link';

const avatarOptions = ['#f8d7da', '#d8f3dc', '#ddeaf6', '#fff3b0'];

export default function NewParentProfilePage() {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-3xl">
        <Link className="text-sm font-semibold text-watchnest-primary" href="/parent/dashboard">
          ← Back to Parent Dashboard
        </Link>

        <section className="mt-4 rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Create Profile</p>
          <h1 className="mt-2 text-3xl font-bold">Add a child profile.</h1>
          <p className="mt-2 text-watchnest-muted">This form is a UI shell using sample options only. It does not create or save a profile yet.</p>

          <form className="mt-8 space-y-6">
            <label className="block">
              <span className="font-semibold">Display name</span>
              <input className="mt-2 w-full rounded-2xl border border-watchnest-border bg-watchnest-background px-4 py-3" placeholder="Example: Mia" type="text" />
            </label>

            <fieldset>
              <legend className="font-semibold">Avatar color</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {avatarOptions.map((color) => (
                  <button key={color} className="h-14 w-14 rounded-full border-2 border-white shadow ring-1 ring-watchnest-border" style={{ backgroundColor: color }} type="button">
                    <span className="sr-only">Choose avatar color {color}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="rounded-3xl border border-dashed border-watchnest-border bg-watchnest-background p-4 text-sm text-watchnest-muted">
              Save action placeholder: backend profile creation will be connected later.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white" type="button">Create Profile (preview)</button>
              <Link className="rounded-2xl border border-watchnest-border bg-white px-5 py-3 text-center font-semibold text-watchnest-primary" href="/parent/profiles">
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
