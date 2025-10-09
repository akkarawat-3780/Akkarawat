export const metadata = {
  title: 'My App',
  description: 'Login system using Next.js 15',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
