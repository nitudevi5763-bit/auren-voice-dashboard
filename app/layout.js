import './globals.css';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

export const metadata = {
  title: 'Auren — AI Voice Infrastructure',
  description: 'Build, deploy and scale AI voice agents.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <MobileNav />
            <div className="px-6 py-8 md:px-10 md:py-10">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
