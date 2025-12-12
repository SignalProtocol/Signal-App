import React from "react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  themeColor: "purple" | "green" | "cyan";
  children?: React.ReactNode;
}

const THEME_STYLES = {
  purple: {
    border: "hover:border-purple-500/30",
    iconText: "text-purple-500",
  },
  green: {
    border: "hover:border-green-500/30",
    iconText: "text-green-500",
  },
  cyan: {
    border: "hover:border-cyan-500/30",
    iconText: "text-cyan-500",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  themeColor,
  children,
}) => {
  const styles = THEME_STYLES[themeColor];

  return (
    <div
      className={`p-5 rounded-2xl bg-gradient-to-br from-[#141418]/90 to-[#1a1a1f]/90 border border-[#2a2a33] relative overflow-hidden group ${styles.border} transition-all duration-300`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className={`w-16 h-16 ${styles.iconText}`}>{icon}</div>
      </div>
      <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
        {title}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};

export default StatCard;
