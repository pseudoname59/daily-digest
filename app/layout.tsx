import type { Metadata } from "next";
import "./globals.css";
import ClientOnly from "../components/ClientOnly";

export const metadata: Metadata = {
  title: "Daily Digest AI",
  description: "Your daily topic digest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        {/* Prevent browser extensions from interfering with hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings from browser extensions
              const originalError = console.error;
              console.error = function(...args) {
                const message = args[0];
                if (typeof message === 'string' && 
                    (message.includes('hydration') || 
                     message.includes('bis_skin_checked') ||
                     message.includes('server rendered HTML'))) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className="bg-white" suppressHydrationWarning>
        <ClientOnly>
          {children}
        </ClientOnly>
      </body>
    </html>
  );
}
