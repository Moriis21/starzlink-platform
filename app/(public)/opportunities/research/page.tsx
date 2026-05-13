"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { FlaskConical, Zap } from "lucide-react";
import { motion } from "framer-motion";

const config = {
  title: "Research Opportunities",
  subtitle: "Contribute to cutting-edge discoveries and innovation through academic and industry research programs across Africa and globally.",
  gradientFrom: "#3b1f6b",
  gradientTo: "#7c3aed",
  icon: FlaskConical,
  badgeField: "research_field",
  badgeLabel: "Field",
};


function ResearchHero() {
  const fields = ["Public Health", "Biomedical", "Agriculture", "Social Sciences", "Natural Sciences", "Data Science"];

  // Atom model — electrons orbiting nucleus
  const electrons = [
    { rx: 60, ry: 20, rotation: 0, delay: 0 },
    { rx: 60, ry: 20, rotation: 60, delay: 0.3 },
    { rx: 60, ry: 20, rotation: 120, delay: 0.6 },
  ];

  const grants = [
    { org: "NIH Fogarty", field: "Global Health", color: "bg-purple-500/40" },
    { org: "CODESRIA", field: "Social Sciences", color: "bg-violet-500/40" },
    { org: "TWAS", field: "Natural Sciences", color: "bg-indigo-500/40" },
    { org: "AAS / AESA", field: "Health & Agriculture", color: "bg-fuchsia-500/40" },
  ];

  return (
    <div className="relative w-full h-72 select-none">
      {/* Atom model SVG — rotating orbits */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {electrons.map((e, i) => (
          <motion.div
            key={i}
            className="absolute w-0 h-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "linear", delay: e.delay }}
          >
            <svg width="130" height="130" viewBox="-65 -65 130 130" className="absolute -top-[65px] -left-[65px] opacity-30">
              <ellipse cx="0" cy="0" rx={e.rx} ry={e.ry}
                fill="none" stroke="white" strokeWidth="1"
                transform={`rotate(${e.rotation})`} />
            </svg>
            {/* Electron dot */}
            <div
              className="absolute w-3 h-3 bg-violet-300 rounded-full shadow-lg"
              style={{
                left: Math.cos((e.rotation * Math.PI) / 180) * e.rx - 6,
                top: Math.sin((e.rotation * Math.PI) / 180) * e.ry - 6,
              }}
            />
          </motion.div>
        ))}

        {/* Nucleus */}
        <motion.div
          className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 -translate-x-1/2 -translate-y-1/2 absolute"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FlaskConical className="w-6 h-6 text-violet-200" />
        </motion.div>
      </div>

      {/* Floating research field tags */}
      {fields.map((field, i) => {
        const angle = (i / fields.length) * 2 * Math.PI;
        const r = 108;
        return (
          <motion.div
            key={field}
            className="absolute bg-white/10 border border-white/20 rounded-full px-2.5 py-1 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${r * Math.cos(angle)}px)`,
              top: `calc(50% + ${r * Math.sin(angle)}px)`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35 }}
          >
            <span className="text-purple-200 text-[9px] font-semibold whitespace-nowrap">{field}</span>
          </motion.div>
        );
      })}

      {/* Top funding org badges */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2">
        {grants.slice(0, 2).map((g, i) => (
          <motion.div
            key={g.org}
            className={`${g.color} border border-white/20 rounded-xl px-2.5 py-1.5 text-center`}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" as const, delay: i * 0.5 }}
          >
            <p className="text-white font-bold text-[10px]">{g.org}</p>
            <p className="text-purple-300 text-[9px]">{g.field}</p>
          </motion.div>
        ))}
      </div>

      {/* Discovery sparkle */}
      <motion.div
        className="absolute top-6 right-4 flex items-center gap-1.5 bg-yellow-400/15 border border-yellow-400/30 rounded-full px-3 py-1.5"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Zap className="w-3.5 h-3.5 text-yellow-300" />
        <span className="text-yellow-300 text-xs font-bold">Funded Research</span>
      </motion.div>
    </div>
  );
}

export default function ResearchPage() {
  return (
    <OpportunityListTemplate
      type="research"
      config={config}
      basePath="/opportunities/research"
      heroDecoration={<ResearchHero />}
    />
  );
}
