"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Globe, Plane } from "lucide-react";
import { motion } from "framer-motion";

const config = {
  title: "Study Abroad",
  subtitle: "Expand your horizons with fully-funded international study programs. From the USA to Europe — your world-class education awaits.",
  gradientFrom: "#1e3a5f",
  gradientTo: "#2563eb",
  icon: Globe,
  badgeField: "destination_country",
  badgeLabel: "Destination",
};


function StudyAbroadHero() {
  const destinations = [
    { flag: "🇺🇸", name: "USA", scholarship: "Fulbright", pos: "top-2 left-4" },
    { flag: "🇬🇧", name: "UK", scholarship: "Chevening", pos: "top-2 right-4" },
    { flag: "🇩🇪", name: "Germany", scholarship: "DAAD", pos: "top-20 left-0" },
    { flag: "🇫🇷", name: "Europe", scholarship: "Erasmus", pos: "top-20 right-0" },
    { flag: "🌍", name: "Africa", scholarship: "MasterCard", pos: "bottom-8 left-4" },
    { flag: "🇯🇵", name: "Japan", scholarship: "World Bank", pos: "bottom-8 right-4" },
  ];

  // Globe meridian lines via SVG
  return (
    <div className="relative w-full h-72 select-none">
      {/* Globe wireframe */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg width="140" height="140" viewBox="0 0 140 140" className="opacity-20">
          <circle cx="70" cy="70" r="65" fill="none" stroke="white" strokeWidth="1.5" />
          <ellipse cx="70" cy="70" rx="35" ry="65" fill="none" stroke="white" strokeWidth="1" />
          <ellipse cx="70" cy="70" rx="65" ry="20" fill="none" stroke="white" strokeWidth="1" />
          <ellipse cx="70" cy="70" rx="65" ry="40" fill="none" stroke="white" strokeWidth="1" />
          <line x1="5" y1="70" x2="135" y2="70" stroke="white" strokeWidth="1" />
          <line x1="70" y1="5" x2="70" y2="135" stroke="white" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Central globe icon */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl z-10"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Globe className="w-8 h-8 text-white" />
      </motion.div>

      {/* Destination badges */}
      {destinations.map((d, i) => (
        <motion.div
          key={d.name}
          className={`absolute ${d.pos} bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-2.5 py-1.5`}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5 + i * 0.12, repeat: Infinity, ease: "easeInOut" as const, delay: i * 0.4 }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base">{d.flag}</span>
            <div>
              <p className="text-white font-bold text-xs">{d.name}</p>
              <p className="text-blue-300 text-[9px]">{d.scholarship}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Animated plane path */}
      <motion.div
        className="absolute z-20"
        animate={{
          x: [-30, 280],
          y: [100, 40],
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
      >
        <Plane className="w-5 h-5 text-white rotate-[30deg]" />
      </motion.div>

      {/* Funding tag */}
      <motion.div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-white text-xs font-bold">✈️ 6 Fully Funded Programs Available</p>
      </motion.div>
    </div>
  );
}

export default function StudyAbroadPage() {
  return (
    <OpportunityListTemplate
      type="study_abroad"
      config={config}
      basePath="/opportunities/study-abroad"
      heroDecoration={<StudyAbroadHero />}
    />
  );
}
