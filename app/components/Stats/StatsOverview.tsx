const StatsOverview = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-3 rounded-lg bg-[#0e0e12]/30">
      {/* Realized Profit */}
      <div className="relative bg-gradient-to-br from-[#141418]/90 to-[#1a1a1f]/90 border border-green-500/20 rounded-xl p-6 hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all duration-300 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-medium">
              Realized Profit
            </h3>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
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
            </div>
          </div>
          <p className="text-green-400 text-3xl font-bold mb-2">$12,540</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">
              +18.5%
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>
      </div>

      {/* Realized Loss */}
      <div className="relative bg-gradient-to-br from-[#141418]/90 to-[#1a1a1f]/90 border border-red-500/20 rounded-xl p-6 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all duration-300 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-medium">
              Realized Loss
            </h3>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
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
            </div>
          </div>
          <p className="text-red-400 text-3xl font-bold mb-2">$2,140</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">
              -4.2%
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>
      </div>

      {/* Open Orders */}
      <div className="relative bg-gradient-to-br from-[#141418]/90 to-[#1a1a1f]/90 border border-indigo-500/20 rounded-xl p-6 hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all duration-300 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-medium">
              Open Orders
            </h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <svg
                className="w-4 h-4 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
              <p className="text-green-400 text-xl font-bold">+$8,430</p>
              <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wide">
                Unrealized Profit
              </p>
            </div>
            <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
              <p className="text-red-400 text-xl font-bold">-$1,210</p>
              <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wide">
                Unrealized Loss
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsOverview;
