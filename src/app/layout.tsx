import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {title:{default:'WatchNest',template:'%s · WatchNest'},description:'A family video library, chosen by you. Approved-only browsing and controlled YouTube playback.',robots:{index:false,follow:false},manifest:'/manifest.webmanifest'};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#193f35'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>}
