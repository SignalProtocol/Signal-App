import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const NoTradingCards = () => {
  return (
    <section className="p-4 rounded-lg border border-[#2a2a33] bg-[#0e0e12]/30">
      {/* Dummy Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { token: "BTC/USDT", leverage: "100x", long: true },
          { token: "PEPE/USDT", leverage: "10x", long: true },
          { token: "SHIBA/USDT", leverage: "5x", short: true },
          { token: "DOGE/USDT", leverage: "20x", long: true },
          { token: "BONK/USDT", leverage: "15x", short: true },
          { token: "WIF/USDT", leverage: "8x", long: true },
        ].map((card, index) => (
          <div
            key={index}
            className="relative border rounded-xl p-4 bg-gradient-to-br from-[#141418]/90 to-[#1a1a1f]/90 border-[#2a2a33] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:border-cyan-500/50"
          >
            <div className="filter grayscale opacity-20 blur-[10px] pointer-events-none select-none">
              {/* Card Header with Token Badge */}
              <div className="flex items-start justify-between mb-3 pb-2 border-b border-[#2a2a33] gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/20 border border-cyan-500/30 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-[10px]">
                      {card.token.split("/")[0].slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-base text-white">
                      {card.token}
                    </p>
                    <p className="text-[9px] text-yellow-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] uppercase tracking-wide">
                      {card.leverage} Leverage
                    </p>
                  </div>
                </div>
                {card.long && (
                  <div
                    className="flex items-center gap-2 border-green-500/50 text-green-400 text-[10px] font-semibold rounded-full border-2"
                    style={{ padding: "3px 10px" }}
                  >
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    LONG
                  </div>
                )}
                {card.short && (
                  <div
                    className="flex items-center gap-2 border-red-500/50 text-red-400 text-[10px] font-semibold rounded-full border-2"
                    style={{ padding: "3px 10px" }}
                  >
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                      />
                    </svg>
                    SHORT
                  </div>
                )}
                <div>
                  <p className="text-[12px] text-yellow-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] uppercase tracking-wide text-end">
                    POSITION SIZE: 5%
                  </p>
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-2 text-xs">
                {/* Entry Zone */}
                <div className="bg-[#1a1a1f]/60 rounded-full p-2 border border-[#2a2a33]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">
                      Entry
                    </span>
                    <span className="text-white font-semibold text-xs">
                      $0.00 - $0.00
                    </span>
                  </div>
                </div>

                {/* Take Profits & Stop Loss Grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center justify-between bg-green-500/5 rounded-full p-1.5 border border-green-500/20">
                    <span className="text-gray-400 text-[10px] font-medium">
                      TP1
                    </span>
                    <span className="text-green-400 font-semibold text-[10px]">
                      $0.00 (0%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-green-500/5 rounded-full p-1.5 border border-green-500/20">
                    <span className="text-gray-400 text-[10px] font-medium">
                      TP2
                    </span>
                    <span className="text-green-400 font-semibold text-[10px]">
                      $0.00 (0%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-green-500/5 rounded-full p-1.5 border border-green-500/20">
                    <span className="text-gray-400 text-[10px] font-medium">
                      TP3
                    </span>
                    <span className="text-green-400 font-semibold text-[10px]">
                      $0.00 (0%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-green-500/5 rounded-full p-1.5 border border-green-500/20">
                    <span className="text-gray-400 text-[10px] font-medium">
                      TP4
                    </span>
                    <span className="text-green-400 font-semibold text-[10px]">
                      $0.00 (0%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-green-500/5 rounded-full p-1.5 border border-green-500/20">
                    <span className="text-gray-400 text-[10px] font-medium">
                      TP5
                    </span>
                    <span className="text-green-400 font-semibold text-[10px]">
                      $0.00 (0%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-red-500/5 rounded-full p-1.5 border border-red-500/20">
                    <span className="text-gray-400 text-[10px] font-medium">
                      SL
                    </span>
                    <span className="text-red-400 font-semibold text-[10px]">
                      $0.00 (0%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center overlay - Connect Wallet prompt */}
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl">
              <div className="pointer-events-auto flex flex-col items-center gap-2">
                <span className="text-sm text-gray-300 uppercase tracking-wider font-bold">
                  {card.token}
                </span>
                <WalletMultiButton className="!w-full !py-2 !px-6 !rounded-full !font-semibold !transition-all !bg-gradient-to-r !from-cyan-600 !to-cyan-500 hover:!from-cyan-700 hover:!to-cyan-600 !shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:!shadow-[0_0_30px_rgba(0,255,255,0.6)] !flex !items-center !gap-2">
                  <svg
                    className="w-3.5 h-3.5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>{" "}
                  Connect Wallet
                </WalletMultiButton>
              </div>
            </div>

            {/* Action Button placeholder */}
            <div className="relative flex justify-end mt-3 pt-2 border-t border-[#2a2a33] z-10"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NoTradingCards;
