import PUBLIC_API_BASE_URL from "@/app";
import { GlobalContext } from "@/app/context/GlobalContext";
import axios from "axios";
import { useEffect, useContext } from "react";
import StatCard from "./StatCard";

const HallOfFame = () => {
  const { dispatch, state } = useContext(GlobalContext);
  const { signalHistory } = state;
  const API_BASE_URL = PUBLIC_API_BASE_URL;

  const getHistorySignalData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/signals?min_age_hours=24&limit=1000`
      );
      const signalsHistory = response?.data;
      dispatch({
        type: "SET_SIGNAL_HISTORY",
        payload: signalsHistory,
      });
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getHistorySignalData();
  }, []);

  if (signalHistory?.length === 0) {
    return;
  }

  // Filter signals to show only analyzed ones with exit targets
  const filteredSignals =
    signalHistory?.signals?.filter(
      (s: any) =>
        s.performance?.analyzed === true &&
        s.performance?.targets_hit &&
        s.performance?.targets_hit.length > 0
    ) || [];

  // Calculate average PnL for profitable trades
  const profitableSignals = filteredSignals?.filter(
    (s: any) => s.performance.final_outcome === "profitable"
  );
  const avgProfit =
    profitableSignals?.length > 0
      ? (
          profitableSignals.reduce(
            (acc: number, curr: any) =>
              acc + (curr.performance.max_profit_pct || 0),
            0
          ) / profitableSignals.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-8 w-full p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-[#2a2a33] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Topline <span className="text-cyan-400">Metrics</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Historical performance of expired signals and their outcomes.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Last Updated
          </p>
          <p className="text-sm font-mono text-cyan-400">
            {new Date(signalHistory?.last_updated * 1000).toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }
            )}
          </p>
        </div>
      </div>

      {/* Statistics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Total Signals",
            value: filteredSignals?.length || 0,
            themeColor: "purple" as const,
            icon: (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
            children: (
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] border border-green-500/20">
                  {filteredSignals?.filter(
                    (s: any) => s.performance.final_outcome === "profitable"
                  ).length || 0}{" "}
                  Profitable
                </span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] border border-red-500/20">
                  {filteredSignals?.filter(
                    (s: any) => s.performance.final_outcome === "stopped_out"
                  ).length || 0}{" "}
                  Stopped
                </span>
              </div>
            ),
          },
          {
            title: "Avg Max Profit",
            value: `+${avgProfit}%`,
            themeColor: "green" as const,
            icon: (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ),
            children: (
              <p className="text-xs text-gray-500">
                Average peak profit across winning signals
              </p>
            ),
          },
          {
            title: "Win Rate",
            value: (
              <div className="flex items-baseline gap-2">
                <span>
                  {filteredSignals?.length > 0
                    ? (
                        (filteredSignals.filter(
                          (s: any) =>
                            s.performance.final_outcome === "profitable"
                        ).length /
                          filteredSignals.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
                <span className="text-green-400 text-xs font-mono">
                  {filteredSignals?.filter(
                    (s: any) => s.performance.final_outcome === "profitable"
                  ).length || 0}
                  W -{" "}
                  {filteredSignals?.filter(
                    (s: any) => s.performance.final_outcome === "stopped_out"
                  ).length || 0}
                  L
                </span>
              </div>
            ),
            themeColor: "cyan" as const,
            icon: (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            children: (
              <div className="w-full h-1.5 bg-[#2a2a33] rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  style={{
                    width: `${
                      filteredSignals?.length > 0
                        ? (
                            (filteredSignals.filter(
                              (s: any) =>
                                s.performance.final_outcome === "profitable"
                            ).length /
                              filteredSignals.length) *
                            100
                          ).toFixed(1)
                        : 0
                    }%`,
                  }}
                />
              </div>
            ),
          },
        ].map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            themeColor={card.themeColor}
            icon={card.icon}
          >
            {card.children}
          </StatCard>
        ))}
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSignals?.map((signal: any) => {
          const isProfit = signal?.performance?.final_outcome === "profitable";
          const isLoss = signal?.performance?.final_outcome === "stopped_out";

          const borderColor = isProfit
            ? "border-green-500/30 group-hover:border-green-500/50"
            : isLoss
            ? "border-red-500/30 group-hover:border-red-500/50"
            : "border-[#2a2a33] group-hover:border-yellow-500/50";

          const glowColor = isProfit
            ? "hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
            : isLoss
            ? "hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]"
            : "hover:shadow-[0_0_30px_rgba(234,179,8,0.10)]";

          const badgeColor = isProfit
            ? "bg-green-500/10 text-green-400 border-green-500/30"
            : isLoss
            ? "bg-red-500/10 text-red-400 border-red-500/30"
            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

          return (
            <div
              key={signal?.uuid}
              className={`group relative rounded-xl bg-[#0e0e12]/50 border ${borderColor} p-4 transition-all duration-300 hover:scale-[1.02] ${glowColor} cursor-default`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a33] border-dashed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1f] p-1.5 border border-[#2a2a33]">
                    <img
                      src={signal?.logo_url}
                      alt={signal?.pair}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {signal?.pair}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          signal?.action === "long"
                            ? "border-green-500/30 text-green-400"
                            : "border-red-500/30 text-red-400"
                        } uppercase font-bold`}
                      >
                        {signal?.action}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {signal?.leverage}x Lev
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-md border text-[10px] uppercase font-bold tracking-wide ${badgeColor}`}
                >
                  {signal?.performance?.final_outcome?.replace("_", " ")}
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#1a1a1f]/50 p-2.5 rounded-lg border border-[#2a2a33]">
                  <p className="text-[10px] text-gray-400 uppercase">
                    Realized PnL
                  </p>
                  <p
                    className={`text-lg font-mono font-bold ${
                      (signal?.performance?.realized_pnl_pct || 0) > 0
                        ? "text-green-400"
                        : (signal?.performance?.realized_pnl_pct || 0) < 0
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    {signal?.performance?.realized_pnl_pct != null
                      ? `${
                          signal?.performance?.realized_pnl_pct > 0 ? "+" : ""
                        }${signal?.performance?.realized_pnl_pct}%`
                      : "0.00%"}
                  </p>
                </div>
                <div className="bg-[#1a1a1f]/50 p-2.5 rounded-lg border border-[#2a2a33]">
                  <p className="text-[10px] text-gray-400 uppercase">
                    Max Profit
                  </p>
                  <p className="text-lg font-mono font-bold text-green-400">
                    +{signal?.performance?.max_profit_pct?.toFixed(2) || "0.00"}
                    %
                  </p>
                </div>
              </div>

              {/* Targets Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Entry: {signal?.entry_price}</span>
                  <span>
                    Targets Hit: {signal?.performance?.targets_hit?.length}/
                    {signal?.exit_targets?.length}
                  </span>
                </div>
                <div className="flex gap-1 h-1.5 w-full">
                  {signal?.exit_targets?.map((_: any, i: any) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full ${
                        i < signal?.performance?.targets_hit?.length
                          ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                          : "bg-[#2a2a33]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-[#2a2a33]">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    {signal?.performance?.hours_analyzed} hours active
                  </span>
                </div>
                {isLoss && (
                  <span className="text-red-400/80 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6 6"
                      />
                    </svg>
                    Drawdown:{" "}
                    {signal?.performance?.max_drawdown_pct?.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HallOfFame;
