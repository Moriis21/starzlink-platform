"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Trophy } from "lucide-react";

const config = {
  title: "Competitions & Awards",
  subtitle: "Showcase your talent, win prizes, and build your portfolio through prestigious competitions.",
  gradientFrom: "#7c2d12",
  gradientTo: "#dc2626",
  icon: Trophy,
  badgeField: "prize",
  badgeLabel: "Prize",
};

export default function CompetitionsPage() {
  return <OpportunityListTemplate type="competition" config={config} basePath="/opportunities/competitions" />;
}
