"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

const config = {
  title: "Volunteer Opportunities",
  subtitle: "Make a lasting difference in communities across Liberia, West Africa, and beyond. Give your time, gain life-changing experience.",
  gradientFrom: "#064e3b",
  gradientTo: "#16a34a",
  icon: Heart,
  badgeField: "commitment_hours",
  badgeLabel: "Commitment",
};


function VolunteerHero() {
  const impactStats = [
    { value: "5K+", label: "Lives Impacted", color: "text-green-300" },
    { value: "120+", label: "Projects Active", color: "text-emerald-300" },
    { value: "15+", label: "Countries", color: "text-teal-300" },
  ];

  // People arranged in a circle
  const people = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
    const r = 90;
    return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle), delay: i * 0.2 };
  });

  return (
    <div className="relative w-full h-72 select-none">
      {/* Community circle of people */}
      {people.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 bg-white/20 border border-white/30 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: p.delay }}
        >
          <Users className="w-4 h-4 text-white/80" />
        </motion.div>
      ))}

      {/* Connection lines — SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
        {people.map((p, i) => {
          const next = people[(i + 1) % people.length];
          return (
            <line
              key={i}
              x1={`${p.x}%`} y1={`${p.y}%`}
              x2={`${next.x}%`} y2={`${next.y}%`}
              stroke="white" strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Central heart */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl">
          <Heart className="w-8 h-8 text-red-300 fill-current" />
        </div>
      </motion.div>

      {/* Floating hearts */}
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${20 + i * 18}%`, bottom: "15%" }}
          animate={{ y: [0, -40, -80], opacity: [1, 0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
        >
          <Heart className="w-4 h-4 text-red-300/60 fill-current" />
        </motion.div>
      ))}

      {/* Impact stats */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-3">
        {impactStats.map(s => (
          <motion.div
            key={s.label}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-center"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
          >
            <p className={`font-extrabold text-sm ${s.color}`}>{s.value}</p>
            <p className="text-white/60 text-[9px]">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function VolunteerPage() {
  return (
    <OpportunityListTemplate
      type="volunteer"
      config={config}
      basePath="/opportunities/volunteer"
      heroDecoration={<VolunteerHero />}
    />
  );
}
