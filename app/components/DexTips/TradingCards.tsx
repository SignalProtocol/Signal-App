import React, { useState, useMemo, useContext } from "react";
import { GlobalContext } from "../../context/GlobalContext";

interface Card {
  token: string;
  entry: string;
  tp1: { price: string; percentage: number };
  tp2: { price: string; percentage: number };
  tp3: { price: string; percentage: number };
  tp4: { price: string; percentage: number };
  tp5: { price: string; percentage: number };
  sl: { price: string; percentage: number };
  leverage: string;
  holding: string;
  long: boolean;
  short: boolean;
  instrument: string;
  positionSize: string;
  uuid: string;
  isUnlocked?: boolean;
}

interface UnblockedSignal {
  uuid: string;
  [key: string]: any; // Allow other properties from the unblocked signal
}

interface TradingCardsProps {
  cards: Card[];
  onUnlock: (index: number, uuid: any) => void;
}

const TradingCards: React.FC<TradingCardsProps> = ({
  cards,
  // unLockedCards,
  onUnlock,
}) => {
  const { state } = useContext(GlobalContext);
  const { unLockedCards } = state;
  const [query, setQuery] = useState("");

  // Create a Map of unblocked signals by UUID for efficient lookup and data access
  const unblockedSignalsMap = useMemo(() => {
    const map = new Map();
    unLockedCards?.forEach((signal) => {
      if (signal.uuid) {
        map.set(signal.uuid, signal);
      }
    });
    return map;
  }, [unLockedCards]);

  // Merge card data with unblocked signal data
  const enrichedCards = useMemo(() => {
    return cards.map((card) => {
      const unblockedSignal = unblockedSignalsMap.get(card.uuid);

      if (unblockedSignal) {
        // Card is unlocked - merge with full signal data
        return {
          ...card,
          token: unblockedSignal.pair || card.token,
          entry: unblockedSignal.entry_zone?.join(" - ") || "-",
          tp1: {
            price: unblockedSignal.exit_zone?.[0]?.price || "-",
            percentage:
              unblockedSignal.exit_zone?.[0]?.pnl_percent?.toFixed(2) || "-",
          },
          tp2: {
            price: unblockedSignal.exit_zone?.[1]?.price || "-",
            percentage:
              unblockedSignal.exit_zone?.[1]?.pnl_percent?.toFixed(2) || "-",
          },
          tp3: {
            price: unblockedSignal.exit_zone?.[2]?.price || "-",
            percentage:
              unblockedSignal.exit_zone?.[2]?.pnl_percent?.toFixed(2) || "-",
          },
          tp4: {
            price: unblockedSignal.exit_zone?.[3]?.price || "-",
            percentage:
              unblockedSignal.exit_zone?.[3]?.pnl_percent?.toFixed(2) || "-",
          },
          tp5: {
            price: unblockedSignal.exit_zone?.[4]?.price || "-",
            percentage:
              unblockedSignal.exit_zone?.[4]?.pnl_percent?.toFixed(2) || "-",
          },
          sl: {
            price: unblockedSignal.stop_loss?.price || "-",
            percentage:
              unblockedSignal.stop_loss?.stop_loss_pnl_percent?.toFixed(2) ||
              "-",
          },
          leverage: unblockedSignal.leverage || card.leverage,
          long: unblockedSignal.action === "Long",
          short: unblockedSignal.action === "Short",
          instrument: unblockedSignal.instrument || card.instrument,
          positionSize: unblockedSignal.position_size_pct || card.positionSize,
          isUnlocked: true,
        };
      }

      // Card is locked - return original with minimal data
      return {
        ...card,
        isUnlocked: false,
      };
    });
  }, [cards, unblockedSignalsMap]);

  const filtered: Array<{
    card: Card & { isUnlocked: boolean };
    index: number;
  }> = useMemo(() => {
    const q = query.trim().toLowerCase();
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!q) return enrichedCards.map((c, i) => ({ card: c, index: i }));
    const nq = normalize(q);
    return enrichedCards
      .map((c, i) => ({ card: c, index: i }))
      .filter(({ card }) => {
        // direct include (case-insensitive)
        if (card.token.toLowerCase().includes(q)) return true;
        // normalized include (ignores punctuation like dots)
        if (normalize(card.token).includes(nq)) return true;
        return false;
      });
  }, [enrichedCards, query]);

  return (
    <section className="p-4 rounded-lg border border-[#2a2a33] bg-[#0e0e12]/30">
      {/* Search Bar and DEX Link */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          {/* search query state controlled input */}
          <input
            type="text"
            placeholder="Search signals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-[#1a1a1f] border border-[#2a2a33] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 border-2 border-indigo-500/50 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span>DEX LINK</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered?.map(({ card, index }) => {
          // Card is unlocked if it has the isUnlocked flag
          const isUnlocked = card.isUnlocked;
          return (
            <div
              key={index}
              className={`relative border rounded-xl p-4 bg-gradient-to-br from-[#141418]/90 to-[#1a1a1f]/90 border-[#2a2a33] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:border-indigo-500/50 ${
                isUnlocked ? "ring-2 ring-green-500/30" : ""
              }`}
            >
              <div
                className={`transition-all duration-300${
                  isUnlocked
                    ? "filter-none opacity-100"
                    : "filter grayscale opacity-20 blur-[10px] pointer-events-none select-none"
                }`}
              >
                {/* Card Header with Token Badge */}
                <div className="flex items-start justify-between mb-3 pb-2 border-b border-[#2a2a33]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
                      <span className="text-indigo-400 font-bold text-[10px]">
                        {card.token.split(".")[0].slice(0, 2)}
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
                      className="flex items-center gap-2 border-green-500/50 text-green-400 text-[10px] font-semibold rounded-sm border-2"
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
                      className="flex items-center gap-2 border-red-500/50 text-red-400 text-[10px] font-semibold rounded-sm border-2"
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
                    {/* <h1 className="font-bold text-base text-white text-right">
                      {card.instrument.toUpperCase()}
                    </h1> */}
                    <p className="text-[12px] text-yellow-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] uppercase tracking-wide">
                      POSITION SIZE: {card.positionSize}%
                    </p>
                  </div>
                </div>

                {/* Card Content - Blurred if locked, clear if unlocked */}
                <div
                  className={`space-y-2 text-xs transition-all duration-300`}
                >
                  {/* Entry Zone */}
                  <div className="bg-[#1a1a1f]/60 rounded-md p-2 border border-[#2a2a33]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">
                        Entry
                      </span>
                      <span className="text-white font-semibold text-xs">
                        {card.entry || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Take Profits & Stop Loss Grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex items-center justify-between bg-green-500/5 rounded-sm p-1.5 border border-green-500/20">
                      <span className="text-gray-400 text-[10px] font-medium">
                        TP1
                      </span>
                      <span className="text-green-400 font-semibold text-[10px]">
                        {card.tp1?.price} ({card?.tp1?.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-green-500/5 rounded-sm p-1.5 border border-green-500/20">
                      <span className="text-gray-400 text-[10px] font-medium">
                        TP2
                      </span>
                      <span className="text-green-400 font-semibold text-[10px]">
                        {card.tp2?.price} ({card?.tp2?.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-green-500/5 rounded-sm p-1.5 border border-green-500/20">
                      <span className="text-gray-400 text-[10px] font-medium">
                        TP3
                      </span>
                      <span className="text-green-400 font-semibold text-[10px]">
                        {card.tp3?.price} ({card?.tp3?.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-green-500/5 rounded-sm p-1.5 border border-green-500/20">
                      <span className="text-gray-400 text-[10px] font-medium">
                        TP4
                      </span>
                      <span className="text-green-400 font-semibold text-[10px]">
                        {card.tp4?.price} ({card?.tp4?.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-green-500/5 rounded-sm p-1.5 border border-green-500/20">
                      <span className="text-gray-400 text-[10px] font-medium">
                        TP5
                      </span>
                      <span className="text-green-400 font-semibold text-[10px]">
                        {card.tp5?.price} ({card?.tp5?.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-red-500/5 rounded-sm p-1.5 border border-red-500/20">
                      <span className="text-gray-400 text-[10px] font-medium">
                        SL
                      </span>
                      <span className="text-red-400 font-semibold text-[10px]">
                        {card.sl.price} ({card.sl.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center overlay PAY button for locked cards */}
              {!isUnlocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl">
                  <div className="pointer-events-auto flex flex-col items-center gap-2">
                    <span className="text-sm text-gray-300 uppercase tracking-wider font-bold">
                      {card.token}
                    </span>
                    <button
                      onClick={() => onUnlock(index, card.uuid)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold transition-all duration-300 transform hover:scale-105 border-2 border-indigo-500/50 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] bg-[#0b0b0d]/60`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>PAY TO UNLOCK TIP</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button - visible only when unlocked */}
              <div className="relative flex justify-end mt-3 pt-2 border-t border-[#2a2a33] z-10">
                {isUnlocked && (
                  <a
                    href={`https://app.hyperliquid.xyz/trade/${
                      card.token.split("/")[0]
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold transition-all duration-300 transform hover:scale-105 border-2 border-green-500/50 text-green-400 hover:border-green-400 hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-transparent no-underline"
                  >
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span>DEX LINK</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TradingCards;
