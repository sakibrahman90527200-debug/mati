import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'মাটি | Your land, in perspective',description:'A citizen land workspace with server-backed checks of 20 fictional land records.',icons:{icon:'/mark.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
