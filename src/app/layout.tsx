import type { Metadata } from 'next';
import './globals.css';
import '../components/Sidebar.css';
import '../components/BottomPlayer.css';
import './Dashboard.css';
import './forum/Forum.css';
import './upload/Upload.css';
import './voting/Voting.css';
import './playlists/Playlists.css';
import './discover/Discover.css';
import './auth.css';

import Sidebar from '@/components/Sidebar';
import BottomPlayer from '@/components/BottomPlayer';
import PageTransition from '@/components/PageTransition';
import Providers from '@/components/Providers';
import { PlayerProvider } from '@/context/PlayerContext';

export const metadata: Metadata = {
  title: 'Echoir | Indie Music Platform',
  description: 'A platform dedicated to indie musicians and listeners',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body>
        <Providers>
          <PlayerProvider>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
            <BottomPlayer />
          </PlayerProvider>
        </Providers>
      </body>
    </html>
  );
}
