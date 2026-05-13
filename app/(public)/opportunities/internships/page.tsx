"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const config = {
  title: "Internships",
  subtitle: "Launch your career with real-world experience at top companies, NGOs, and institutions across Liberia, Africa, and beyond.",
  gradientFrom: "#0d1b4b",
  gradientTo: "#1a3c8f",
  icon: Briefcase,
  badgeField: "duration",
  badgeLabel: "Duration",
};


function InternshipHero() {
  const skills = ["Leadership", "Communication", "Data Analysis", "Project Mgmt", "Research", "Teamwork"];
  const cards = [
    { company: "USAID Liberia", role: "Agriculture Intern", pay: "$300/mo", color: "bg-blue-500" },
    { company: "United Nations", role: "Development Intern", pay: "Allowance", color: "bg-indigo-500" },
    { company: "African Dev. Bank", role: "Young Professionals", pay: "Salary", color: "bg-violet-600" },
    { company: "Google Africa", role: "Tech Scholarship", pay: "Stipend", color: "bg-sky-500" },
  ];

  return (
    <div className="relative w-full h-72 select-none">
      {/* Central briefcase */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30">
          <Briefcase className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Rotating orbit ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-48 h-48 rounded-full border border-white/15" />
      </motion.div>

      {/* Floating job cards */}
      {cards.map((card, i) => {
        const positions = [
          "top-0 left-0", "top-0 right-0",
          "bottom-0 left-0", "bottom-0 right-0",
        ];
        return (
          <motion.div
            key={card.company}
            className={`absolute ${positions[i]} bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-2.5 w-36`}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3 + i * 0.35, repeat: Infinity, ease: "easeInOut" as const, delay: i * 0.7 }}
          >
            <div className={`w-5 h-5 ${card.color} rounded-md mb-1.5 flex items-center justify-center`}>
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <p className="text-white text-xs font-bold leading-tight">{card.company}</p>
            <p className="text-white/70 text-[10px]">{card.role}</p>
            <p className="text-green-300 text-[10px] font-semibold mt-0.5">{card.pay}</p>
          </motion.div>
        );
      })}

      {/* Skill pills orbiting */}
      {skills.map((skill, i) => {
        const angle = (i / skills.length) * 2 * Math.PI;
        const r = 105;
        const x = 50 + r * Math.cos(angle);
        const y = 50 + r * Math.sin(angle);
        return (
          <motion.div
            key={skill}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white/10 border border-white/20 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          >
            {skill}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function InternshipsPage() {
  return (
    <OpportunityListTemplate
      type="internship"
      config={config}
      basePath="/opportunities/internships"
      heroDecoration={<InternshipHero />}
    />
  );
}
