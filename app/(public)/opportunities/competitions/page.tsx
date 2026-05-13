"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";

const config = {
  title: "Competitions & Awards",
  subtitle: "Showcase your talent, win prizes, and build your portfolio through prestigious competitions open to Liberian and African students.",
  gradientFrom: "#7c2d12",
  gradientTo: "#dc2626",
  icon: Trophy,
  badgeField: "prize",
  badgeLabel: "Prize",
};


function CompetitionsHero() {
  const podium = [
    { place: "2nd", height: "h-20", color: "bg-white/20", prize: "$50K", delay: 0.3 },
    { place: "1st", height: "h-28", color: "bg-yellow-400/40", prize: "$1M", delay: 0 },
    { place: "3rd", height: "h-14", color: "bg-white/15", prize: "$25K", delay: 0.6 },
  ];

  const stars = Array.from({ length: 10 }, (_, i) => ({
    x: 10 + (i * 8.5) % 80,
    y: 10 + (i * 13) % 60,
    size: 8 + (i % 3) * 6,
    delay: i * 0.25,
  }));

  return (
    <div className="relative w-full h-72 select-none">
      {/* Background twinkling stars */}
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300/60"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: s.delay }}
        >
          <Star className="fill-current" style={{ width: s.size, height: s.size }} />
        </motion.div>
      ))}

      {/* Podium */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1">
        {podium.map((p, i) => (
          <motion.div
            key={p.place}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: p.delay, ease: "backOut" }}
            style={{ originY: 1 }}
          >
            <div className={`${p.height} w-16 ${p.color} border border-white/20 rounded-t-xl flex flex-col items-center justify-end pb-2`}>
              <span className="text-white font-extrabold text-xs">{p.place}</span>
              <span className="text-yellow-300 text-[10px] font-bold">{p.prize}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trophy at top */}
      <motion.div
        className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-16 h-16 bg-yellow-400/30 rounded-full flex items-center justify-center border-2 border-yellow-300/50 shadow-xl">
          <Trophy className="w-8 h-8 text-yellow-300" />
        </div>
        {/* Trophy glow */}
        <motion.div
          className="w-20 h-4 bg-yellow-400/20 rounded-full mt-1 blur-sm"
          animate={{ scaleX: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Floating competition badges */}
      {[
        { label: "Hult Prize", prize: "$1,000,000", pos: "top-14 right-2" },
        { label: "Anzisha", prize: "$25,000", pos: "top-14 left-2" },
        { label: "MIT Solve", prize: "$150,000", pos: "bottom-16 right-0" },
      ].map((b, i) => (
        <motion.div
          key={b.label}
          className={`absolute ${b.pos} bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-center`}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3 + i * 0.15, repeat: Infinity, ease: "easeInOut" as const, delay: i * 0.5 }}
        >
          <p className="text-yellow-300 font-extrabold text-xs">{b.prize}</p>
          <p className="text-white/70 text-[9px]">{b.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function CompetitionsPage() {
  return (
    <OpportunityListTemplate
      type="competition"
      config={config}
      basePath="/opportunities/competitions"
      heroDecoration={<CompetitionsHero />}
    />
  );
}
