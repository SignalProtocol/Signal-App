import { useWallet } from "@solana/wallet-adapter-react";

const StatsOverview = () => {
  const { connected } = useWallet();

  return (
    <section
      className="mb-3 rounded-lg bg-[#0e0e12]/30"
      style={{ filter: connected ? "none" : "blur(10px)" }}
    >
      {/* Single PnL Coming Soon Box */}
      <div className="relative bg-gradient-to-br from-[#141418]/90 to-[#1a1a1f]/90 border border-cyan-500/20 rounded-xl p-6 hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all duration-300 overflow-hidden group min-h-[140px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl group-hover:bg-cyan-400/10 transition-all"></div>

        {/* Coming Soon Content */}
        <div className="relative flex flex-col items-center justify-center gap-4 h-full py-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-400/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.15)] border border-cyan-500/20">
            <svg
              className="w-8 h-8 text-cyan-300/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold gradient-text-color mb-1">
              PnL Coming Soon
            </h3>
            <p className="text-gray-400 text-sm">
              Track your performance metrics
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsOverview;
