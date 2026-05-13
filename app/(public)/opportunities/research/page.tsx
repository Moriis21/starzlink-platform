"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { FlaskConical } from "lucide-react";

const config = {
  title: "Research Opportunities",
  subtitle: "Contribute to cutting-edge research and innovation through academic and industry research programs.",
  gradientFrom: "#3b1f6b",
  gradientTo: "#7c3aed",
  icon: FlaskConical,
  badgeField: "research_field",
  badgeLabel: "Field",
};

export default function ResearchPage() {
  return <OpportunityListTemplate type="research" config={config} basePath="/opportunities/research" />;
}
