import Head from "next/head";

export const metadata = {
  title: "Flappy Nexus",
  description: "Web3 arcade powered by Privy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
      </Head>
      <body className="text-white min-h-screen font-sans relative overflow-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.PRIVY_APP_ID = "${process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}"; window.PRIVY_CLIENT_ID = "${process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || ""}";`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
