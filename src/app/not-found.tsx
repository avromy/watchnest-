import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="shell">
      <div className="empty">
        <h1>This page isn’t here.</h1>
        <p>Head back to your WatchNest library.</p>
        <Link className="button" href="/watch/home">
          My library
        </Link>
      </div>
    </main>
  );
}
