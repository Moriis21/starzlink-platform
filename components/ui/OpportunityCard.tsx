"use client";

import Link from "next/link";
import { Bookmark, MapPin, Calendar, Building2, ExternalLink } from "lucide-react";
import { cn, formatDate, getDaysLeft, getStatusColor } from "@/lib/utils";
import { useState } from "react";

interface OpportunityCardProps {
  id: string;
  type: "job" | "scholarship" | "training" | "campus-update";
  title: string;
  organization: string;
  location?: string;
  deadline?: string;
  description: string;
  category?: string;
  tags?: string[];
  status?: string;
  image_url?: string;
}

const typeColors: Record<string, string> = {
  job: "bg-blue-100 text-blue-700",
  scholarship: "bg-purple-100 text-purple-700",
  training: "bg-orange-100 text-orange-700",
  "campus-update": "bg-green-100 text-green-700",
};

const typeLabels: Record<string, string> = {
  job: "Job",
  scholarship: "Scholarship",
  training: "Training",
  "campus-update": "Campus Update",
};

export default function OpportunityCard({
  id, type, title, organization, location, deadline, description, category, tags = [], status, image_url
}: OpportunityCardProps) {
  const [saved, setSaved] = useState(false);
  const daysLeft = deadline ? getDaysLeft(deadline) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      {image_url && (
        <div className="h-40 overflow-hidden">
          <img src={image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", typeColors[type])}>
              {typeLabels[type]}
            </span>
            {category && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {category}
              </span>
            )}
            {status && (
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getStatusColor(status))}>
                {status}
              </span>
            )}
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={cn("flex-shrink-0 p-1.5 rounded-lg transition-colors", saved ? "text-[#1a3c8f] bg-blue-50" : "text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50")}
          >
            <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-[#1a3c8f] transition-colors line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{organization}</span>
        </div>

        {location && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {deadline && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", daysLeft !== null && daysLeft <= 7 ? "text-red-600" : "text-gray-500")}>
              <Calendar className="w-3.5 h-3.5" />
              {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Due today" : "Expired"} · {formatDate(deadline)}
            </div>
          )}
          <Link
            href={
              type === "job" ? `/opportunities/jobs/${id}` :
              type === "scholarship" ? `/opportunities/scholarships/${id}` :
              type === "training" ? `/trainings/${id}` :
              `/campus-updates/${id}`
            }
            className="flex items-center gap-1 text-sm font-semibold text-[#1a3c8f] hover:underline ml-auto"
          >
            View Details <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
