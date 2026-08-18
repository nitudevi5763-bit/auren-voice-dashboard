import './globals.css';

export const metadata = {
  title: 'Auren Control — Voice Agent Dashboard',
  description: 'Internal dashboard to manage Auren.ai voice agent clients',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
