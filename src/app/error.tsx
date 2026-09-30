'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="main-content" className="shell"><div className="empty"><h1>Let’s try that again.</h1><p>WatchNest couldn’t load this page. Your library stays protected.</p><button className="button" onClick={reset}>Try again</button> <Link href="/" className="button-secondary">Go home</Link></div></main>}
