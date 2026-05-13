"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Briefcase } from "lucide-react";

const config = {
  title: "Internships",
  subtitle: "Gain real-world experience with top companies and organizations across Africa and beyond.",
  gradientFrom: "#0d1b4b",
  gradientTo: "#1a3c8f",
  icon: Briefcase,
  badgeField: "duration",
  badgeLabel: "Duration",
};

export default function InternshipsPage() {
  return <OpportunityListTemplate type="internship" config={config} basePath="/opportunities/internships" />;
}
