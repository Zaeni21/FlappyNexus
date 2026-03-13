import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Flappy Nexus</title>
      </Head>

      <div id="star-bg" className="stars"></div>
      <canvas id="starfield" className="fixed inset-0 w-full h-full z-10"></canvas>
      <canvas id="gameCanvas" className="absolute inset-0 w-full h-full z-20"></canvas>

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-lg bg-black/40 border-b border-white/10">
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center shadow-xl">
            <span className="text-sm font-bold">FN</span>
          </div>
          <div className="text-white font-bold text-lg">Flappy Nexus</div>
        </a>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <button id="lang-en" className="nexus-btn px-3 py-1 text-xs rounded-full">
              EN
            </button>
            <button id="lang-id" className="nexus-btn px-3 py-1 text-xs rounded-full">
              ID
            </button>
          </div>

          <div
            id="walletDisplay"
            className="nexus-btn flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12.79V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-2.79M16 12h2"
              />
            </svg>
            <div id="wallet-status" className="w-2.5 h-2.5 bg-gray-500 rounded-full"></div>
            <span id="wallet-text" className="text-sm font-medium" data-i18n="wallet_connect">
              Connect Privy
            </span>
          </div>

          <div
            id="walletPopup"
            className="glass-panel absolute right-6 top-16 mt-2 p-3 rounded hidden z-50 min-w-max"
          >
            <p className="text-green-300 text-sm mb-2">Connected</p>
            <button
              id="disconnectBtn"
              className="bg-red-600 hover:bg-red-700 px-3 py-1 text-xs rounded font-semibold"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <section
        id="mode-selection"
        className="absolute top-[calc(50%+40px)] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-11/12 max-w-xl"
      >
        <div className="glass-panel rounded-2xl p-6 md:p-8 text-center space-y-6">
          <div>
            <p className="text-purple-300 tracking-widest text-xs mb-2">
              <span data-i18n="tagline">WEB3 ARCADE EXPERIENCE</span>
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold">Flappy Nexus</h1>
            <p className="text-gray-300 mt-2 text-sm" data-i18n="subtitle">
              Build score setinggi mungkin, lalu submit ke onchain leaderboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              data-action="start-offchain"
              className="menu-btn bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl font-bold"
            >
              <span data-i18n="play_offchain">Play Offchain</span>
            </button>
            <button
              data-action="start-onchain"
              className="menu-btn bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold"
            >
              <span data-i18n="play_onchain">Play Onchain</span>
            </button>
            <button
              data-action="show-leaderboard"
              className="menu-btn bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-bold sm:col-span-2"
            >
              <span data-i18n="leaderboard">Leaderboard</span>
            </button>
            <button
              data-action="mint"
              className="menu-btn bg-yellow-500 hover:bg-yellow-600 px-5 py-3 rounded-xl font-bold sm:col-span-2 text-black"
            >
              <span data-i18n="mint">Mint NFT Skin</span>
            </button>
          </div>

          <div className="hero-float flex justify-center">
            <img
              src="https://ipfs.io/ipfs/bafybeielnggeoq3acfq2kpr7mm2ofkhovwppowxllfaev6ke47rwsde3k4"
              alt="Flappy Hero"
              className="w-28 md:w-36 rounded-xl shadow-xl"
            />
          </div>

          <p className="text-xs text-gray-400" data-i18n="tip">
            Tip: tekan <span className="font-semibold text-gray-200">Space</span> / tap layar untuk terbang.
          </p>
        </div>
      </section>

      <div id="hud" className="absolute top-4 left-4 z-40 hidden">
        <div className="score-pill glass-panel rounded-full px-4 py-2 font-semibold">Score: 0</div>
      </div>

      <div
        id="leaderboard-popup"
        className="hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-panel p-6 rounded-xl z-50 w-11/12 max-w-sm"
      >
        <h2 className="text-lg font-bold mb-4">Top Players</h2>
        <ul id="leaderboard-list" className="space-y-1 text-sm"></ul>

        <div id="admin-distribute" className="mt-4 hidden">
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold">
            Distribusi Reward
          </button>
        </div>

        <button
          id="closeLeaderboardBtn"
          className="mt-4 bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded text-sm"
        >
          Close
        </button>
      </div>

      <a
        href="/Stake/index.html"
        className="fixed bottom-16 right-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-full flex items-center gap-2 shadow-lg z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 1.343-3 3v1H6v6h12v-6h-3v-1c0-1.657-1.343-3-3-3z"
          />
        </svg>
        Stake
      </a>

      <div
        id="toast"
        className="hidden fixed bottom-16 left-1/2 -translate-x-1/2 glass-panel rounded-full px-4 py-2 z-50 text-sm toast"
      ></div>

      <footer>
        <div className="fixed bottom-2 left-4 text-gray-500 text-[10px]">
          © 2025 Built by 0xzvan with passion for degen culture
        </div>
        <div className="fixed bottom-2 right-4 flex items-center space-x-3 text-white z-50">
          <a
            href="https://twitter.com/0xzvan"
            target="_blank"
            className="hover:text-purple-400"
            rel="noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M18.244 3h2.852l-6.225 7.1 7.34 10.9h-5.748l-4.126-6.175L6.716 21H3.857l6.651-7.582L3 3h5.82l3.705 5.62L18.244 3Zm-.992 17h1.578L8.72 4H7.086l10.166 16Z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/0xzvan"
            target="_blank"
            className="hover:text-pink-400"
            rel="noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 1.5h-9A4 4 0 0 0 3.5 7.5v9A4 4 0 0 0 7.5 20.5h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4Zm-4.5 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5Zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5Zm4.63-.63a.75.75 0 1 1 1.5 0a.75.75 0 0 1-1.5 0Z" />
            </svg>
          </a>
        </div>
      </footer>

      <audio
        id="bg-music"
        src="https://aqua-glad-tern-369.mypinata.cloud/ipfs/bafybeifokiywb2vpbbuwifddxxyr6kxft7bo4j3isoojfdgox7v6tcer7q"
        loop
        hidden
      ></audio>

      <script type="module" src="/assets/js/app.js"></script>
    </>
  );
}
