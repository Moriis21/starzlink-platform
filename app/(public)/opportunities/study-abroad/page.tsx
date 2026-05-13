"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Globe } from "lucide-react";

const config = {
  title: "Study Abroad",
  subtitle: "Expand your horizons with international study programs and exchange opportunities around the world.",
  gradientFrom: "#1e3a5f",
  gradientTo: "#2563eb",
  icon: Globe,
  badgeField: "destination_country",
  badgeLabel: "Destination",
};

export default function StudyAbroadPage() {
  return <OpportunityListTemplate type="study_abroad" config={config} basePath="/opportunities/study-abroad" />;
}
