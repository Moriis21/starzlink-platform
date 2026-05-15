import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function GET() {
  const results: any[] = [];

  const scholarships = [
    {
      title: "Japanese Government (MEXT) Scholarship for Liberians 2027",
      provider: "Embassy of Japan / Japanese Government",
      description: "Open to Liberian citizens for Masters and Doctoral studies at Japanese graduate schools. Includes 6 months Japanese language training. Required documents: Application Form, Placement Preference Form, Field of Study Plan, Notarized transcripts, Certificate of Health, Recommendation Letter. Submit to Mr. Yancon-Dargbe Nimley, Ma-Bea Shop, Chugbor Community, Old Road-Sinkor, Monrovia, Liberia. Tel: 0886-546-745 / 0770-178-764. Suggested universities include University of Osaka, Kyoto University, University of Tokyo, Nagoya University, Sophia University, Keio University, Meiji University, and University of Tsukuba. Note: scholarship schedule may be changed or cancelled.",
      country: "Japan",
      study_level: "Masters, Doctoral",
      funding_type: "Fully Funded",
      deadline: "2026-05-29",
      link: "https://www.studyinjapan.go.jp/en/smap_stopj-applications_research.html",
      status: "active",
      eligibility: "Liberian citizens born on or after April 2, 1992. Must be willing to learn Japanese and be physically and mentally fit for study in Japan.",
      benefits: "Full tuition, living allowance, return airfare. Duration 18 months to 2 years including 6 months Japanese language training.",
    },
    {
      title: "Queen Elizabeth Commonwealth Scholarships 2026/2027",
      provider: "Association of Commonwealth Universities (ACU)",
      description: "Fully funded Masters degrees for citizens of Commonwealth countries to study in low and middle-income Commonwealth nations. The program promotes development, intercultural exchange, and academic excellence. African countries are among the primary focus regions for this cycle.",
      country: "Multiple Commonwealth Countries",
      study_level: "Masters",
      funding_type: "Fully Funded",
      deadline: "2026-06-03",
      link: "https://www.acu.ac.uk/funding-opportunities/for-students/scholarships/queen-elizabeth-commonwealth-scholarships/",
      status: "active",
      eligibility: "Citizens of Commonwealth countries applying for a Masters at a participating low or middle-income Commonwealth university.",
      benefits: "Full tuition, accommodation, living stipend, return flights, and additional allowances.",
    },
    {
      title: "Women for Africa Foundation Learn Africa Scholarship 2026/2027",
      provider: "Women for Africa Foundation",
      description: "The Learn Africa Scholarship promotes access to quality higher education for young African women and strengthens their role in development. Supports African women pursuing undergraduate or postgraduate studies at partner universities. Open to women across sub-Saharan Africa.",
      country: "Spain / Multiple",
      study_level: "Undergraduate, Masters",
      funding_type: "Fully Funded",
      deadline: "2026-04-19",
      link: "https://www.opportunitiesforafricans.com/women-for-africa-foundation-learn-africa-scholarship-programme-2026-2027-for-young-african-women/",
      status: "active",
      eligibility: "Young African women demonstrating academic excellence and leadership potential.",
      benefits: "Full scholarship covering tuition, living expenses, and travel support.",
    },
    {
      title: "Mastercard Foundation Scholars Program – University of Pretoria 2027",
      provider: "Mastercard Foundation and University of Pretoria",
      description: "Full scholarships for academically talented yet economically disadvantaged students from Africa. Includes undergraduate and postgraduate options with mentorship, leadership development, and career readiness programs. One of the most comprehensive scholarship programs for African students.",
      country: "South Africa",
      study_level: "Undergraduate, Masters",
      funding_type: "Fully Funded",
      deadline: "2026-08-31",
      link: "https://www.up.ac.za/mastercard-foundation-scholars-programme",
      status: "active",
      eligibility: "Academically talented African students from economically disadvantaged backgrounds. UG deadline August 31 2026, PG deadline September 30 2026.",
      benefits: "Full tuition, accommodation, meals, books, laptop, health insurance, and leadership development programs.",
    },
  ];

  const opportunities = [
    {
      title: ".ORG Impact Awards 2026 — Up to $50,000 Grant",
      organization: "Public Interest Registry (.ORG)",
      description: "The .ORG Impact Awards recognize individuals and organizations creating social impact through advocacy, education, community development, gender equality, health, environmental sustainability, and more. Winners receive up to $50,000 in funding along with global recognition and visibility on the .ORG platform. Open worldwide.",
      category: "Award / Grant",
      deadline: "2026-05-27",
      link: "https://pir.org/for-orgs/org-impact-awards/",
      status: "active",
      location: "Global (International)",
      eligibility: "Open to nonprofits, NGOs, social enterprises, and civic organizations worldwide working in advocacy, education, health, environment, community development, or gender equality.",
      benefits: "Up to $50,000 in funding plus global recognition and platform visibility.",
      opportunity_type: "grant",
    },
    {
      title: "CEPF Grant – Guinean Forests of West Africa Biodiversity Conservation",
      organization: "Critical Ecosystem Partnership Fund (CEPF)",
      description: "Supporting NGOs in Cameroon, Cote d'Ivoire, Equatorial Guinea, Ghana, Liberia, and Sao Tome for biodiversity conservation in the Guinean Forests of West Africa Biodiversity Hotspot. This is a significant opportunity for Liberian civil society organizations working on environmental conservation.",
      category: "Environmental Grant",
      deadline: "2026-05-11",
      link: "https://www.cepf.net/grants/where-we-work/africa/guinean-forests-west-africa",
      status: "active",
      location: "Liberia, Ghana, Cameroon, Cote d'Ivoire, Equatorial Guinea",
      eligibility: "NGOs and civil society organizations in Guinean Forest hotspot countries working on biodiversity and ecosystem conservation.",
      benefits: "Grants ranging from $50,000 to $250,000 for biodiversity conservation projects.",
      opportunity_type: "grant",
    },
    {
      title: "EU Support for Civil Society Organisations in Liberia – 2.35 Million Euros",
      organization: "European Union Delegation in Liberia",
      description: "Major EU funding opportunity for Liberian NGOs. Lot 1 focuses on environmental sustainability, climate action and green growth. Lot 2 focuses on financial and democratic governance. One of the most significant funding opportunities for Liberian civil society organizations in 2026.",
      category: "Development Grant",
      deadline: "2026-04-06",
      link: "https://www2.fundsforngos.org/tag/liberia/",
      status: "active",
      location: "Liberia",
      eligibility: "Liberian NGOs and civil society organizations in environment/climate or governance sectors.",
      benefits: "Total pool of 2.35 million euros across two lots for qualifying Liberian organizations.",
      opportunity_type: "grant",
    },
    {
      title: "Pandemic Fund – West Africa Prevention and Preparedness Grant",
      organization: "The Pandemic Fund / World Bank",
      description: "The Pandemic Fund supports strengthening pandemic prevention, preparedness and response systems in 15 countries including Liberia. Supports health system strengthening, surveillance networks, and community health capacity building. Rolling deadline through March 2027.",
      category: "Health Grant",
      deadline: "2027-03-31",
      link: "https://www.worldbank.org/en/programs/pandemic-fund",
      status: "active",
      location: "Liberia and 14 other eligible countries",
      eligibility: "Government agencies, NGOs, and health organizations in eligible countries including Liberia working on pandemic preparedness.",
      benefits: "Multi-million dollar grants from a total pool of $244 million for pandemic preparedness programs.",
      opportunity_type: "grant",
    },
  ];

  for (const s of scholarships) {
    try {
      const { data, error } = await insforge.database
        .from("scholarships")
        .insert([{ ...s, created_at: new Date().toISOString() }])
        .select("id,title");
      results.push({
        table: "scholarships",
        title: s.title,
        success: !error,
        id: (data as any)?.[0]?.id,
        error: (error as any)?.message,
      });
    } catch (e: any) {
      results.push({ table: "scholarships", title: s.title, success: false, error: e.message });
    }
  }

  for (const o of opportunities) {
    try {
      const { data, error } = await insforge.database
        .from("opportunities")
        .insert([{ ...o, created_at: new Date().toISOString() }])
        .select("id,title");
      results.push({
        table: "opportunities",
        title: o.title,
        success: !error,
        id: (data as any)?.[0]?.id,
        error: (error as any)?.message,
      });
    } catch (e: any) {
      results.push({ table: "opportunities", title: o.title, success: false, error: e.message });
    }
  }

  return NextResponse.json({
    results,
    inserted: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  });
}
