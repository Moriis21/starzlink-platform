"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const config = {
  title: "Grants & Fellowships",
  subtitle: "Secure funding for your research, projects, and academic pursuits with verified grants and fellowships from global organizations.",
  gradientFrom: "#064e3b",
  gradientTo: "#059669",
  icon: DollarSign,
  badgeField: "amount",
  badgeLabel: "Amount",
};


function GrantsHero() {
  const grants = [
    { name: "Tony Elumelu", amount: "$5,000", color: "bg-emerald-500" },
    { name: "Echoing Green", amount: "$90,000", color: "bg-teal-500" },
    { name: "Ford Foundation", amount: "$50,000/yr", color: "bg-green-600" },
    { name: "Mandela YALI", amount: "Fully Funded", color: "bg-emerald-700" },
  ];

  const bars = [40, 60, 80, 55, 95, 70, 85];

  return (
    <div className="relative w-full h-72 select-none flex items-center justify-center">
      {/* Central dollar circle */}
      <motion.div
        className="absolute w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <DollarSign className="w-10 h-10 text-white" />
      </motion.div>

      {/* Pulsing rings */}
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{ width: 60 + i * 40, height: 60 + i * 40 }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
        />
      ))}

      {/* Grant amount cards */}
      {grants.map((g, i) => {
        const angles = [-130, -50, 50, 130];
        const r = 110;
        const rad = (angles[i] * Math.PI) / 180;
        return (
          <motion.div
            key={g.name}
            className="absolute bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-3 py-2 text-center"
            style={{ left: `calc(50% + ${r * Math.cos(rad)}px)`, top: `calc(50% + ${r * Math.sin(rad)}px)`, transform: "translate(-50%,-50%)" }}
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3 + i * 0.24, repeat: Infinity, ease: "easeInOut" as const, delay: i * 0.6 }}
          >
            <p className="text-green-300 font-extrabold text-sm">{g.amount}</p>
            <p className="text-white/70 text-[10px] mt-0.5">{g.name}</p>
          </motion.div>
        );
      })}

      {/* Animated bar chart at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-1.5">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="w-4 bg-white/25 rounded-t-sm"
            initial={{ height: 0 }}
            animate={{ height: h / 5 * 4 }}
            transition={{ duration: 1, delay: i * 0.12, ease: "easeOut" }}
            style={{ height: h / 5 * 4 }}
          />
        ))}
      </div>

      {/* TrendingUp indicator */}
      <motion.div
        className="absolute top-4 right-4 bg-green-400/20 border border-green-400/40 rounded-xl p-2 flex items-center gap-1.5"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <TrendingUp className="w-4 h-4 text-green-300" />
        <span className="text-green-300 text-xs font-bold">$500M+ Funded</span>
      </motion.div>
    </div>
  );
}

export default function GrantsPage() {
  return (
    <OpportunityListTemplate
      type="grant"
      config={config}
      basePath="/opportunities/grants"
      heroDecoration={<GrantsHero />}
    />
  );
}
