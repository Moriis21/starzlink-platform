"use client";

import OpportunityListTemplate from "@/components/opportunities/OpportunityListTemplate";
import { Heart } from "lucide-react";

const config = {
  title: "Volunteer Opportunities",
  subtitle: "Make a difference in your community and gain meaningful experience through volunteer work.",
  gradientFrom: "#064e3b",
  gradientTo: "#16a34a",
  icon: Heart,
  badgeField: "commitment_hours",
  badgeLabel: "Hours/Week",
};

export default function VolunteerPage() {
  return <OpportunityListTemplate type="volunteer" config={config} basePath="/opportunities/volunteer" />;
}
