"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { DollarSign } from "lucide-react";

const config = {
  title: "Grants & Fellowships",
  subtitle: "Secure funding for your research, projects, and academic pursuits with verified grants and fellowships.",
  gradientFrom: "#064e3b",
  gradientTo: "#059669",
  icon: DollarSign,
  badgeField: "amount",
  badgeLabel: "Amount",
};

export default function GrantsPage() {
  return <OpportunityListTemplate type="grant" config={config} basePath="/opportunities/grants" />;
}
