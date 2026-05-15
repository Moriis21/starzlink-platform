export interface ProfessionCategory {
  category: string;
  professions: string[];
}

export const PROFESSION_CATEGORIES: ProfessionCategory[] = [
  {
    category: "Student / Graduate",
    professions: ["Student", "Graduate", "Postgraduate Student", "PhD Candidate", "Intern", "Apprentice", "Trainee"],
  },
  {
    category: "Technology & IT",
    professions: [
      "Software Engineer", "Software Developer", "Web Developer", "Frontend Developer",
      "Backend Developer", "Full-Stack Developer", "Mobile Developer", "iOS Developer",
      "Android Developer", "UI/UX Designer", "Product Designer", "Graphic Designer",
      "Motion Designer", "3D Artist", "Game Developer", "Cybersecurity Analyst",
      "Network Engineer", "Systems Administrator", "Cloud Engineer", "DevOps Engineer",
      "Data Engineer", "Data Analyst", "Data Scientist", "Machine Learning Engineer",
      "AI Engineer", "Business Intelligence Analyst", "Database Administrator",
      "IT Support Specialist", "IT Manager", "Chief Technology Officer",
      "Software Tester", "QA Engineer", "Blockchain Developer", "Technical Writer",
    ],
  },
  {
    category: "Healthcare & Medicine",
    professions: [
      "Medical Doctor", "General Practitioner", "Surgeon", "Pediatrician",
      "Gynecologist", "Cardiologist", "Neurologist", "Psychiatrist", "Dentist",
      "Pharmacist", "Nurse", "Registered Nurse", "Midwife", "Laboratory Technician",
      "Radiographer", "Physiotherapist", "Occupational Therapist", "Public Health Officer",
      "Epidemiologist", "Nutritionist", "Dietitian", "Optometrist",
      "Community Health Worker", "Medical Researcher", "Health Administrator",
      "Paramedic", "Biomedical Engineer", "Medical Records Officer",
    ],
  },
  {
    category: "Education & Research",
    professions: [
      "Teacher", "Primary School Teacher", "Secondary School Teacher", "Lecturer",
      "University Professor", "Assistant Professor", "Education Officer",
      "School Principal", "Academic Researcher", "Curriculum Developer",
      "Education Consultant", "Librarian", "Special Education Teacher",
      "Early Childhood Educator", "Training Specialist", "Research Analyst",
      "Research Scientist", "Social Researcher", "Policy Researcher",
    ],
  },
  {
    category: "Business & Finance",
    professions: [
      "Accountant", "Auditor", "Tax Consultant", "Financial Analyst",
      "Investment Analyst", "Banker", "Loan Officer", "Financial Advisor",
      "Insurance Agent", "Insurance Underwriter", "Actuary", "Business Analyst",
      "Business Development Manager", "Sales Manager", "Sales Representative",
      "Account Manager", "Procurement Officer", "Supply Chain Manager",
      "Logistics Officer", "Operations Manager", "General Manager",
      "Chief Executive Officer", "Chief Financial Officer", "Chief Operating Officer",
      "Entrepreneur", "Business Owner", "Startup Founder",
      "Management Consultant", "Strategy Consultant",
    ],
  },
  {
    category: "Engineering",
    professions: [
      "Civil Engineer", "Structural Engineer", "Mechanical Engineer",
      "Electrical Engineer", "Electronics Engineer", "Chemical Engineer",
      "Environmental Engineer", "Petroleum Engineer", "Mining Engineer",
      "Industrial Engineer", "Aerospace Engineer", "Automotive Engineer",
      "Marine Engineer", "Water Resources Engineer", "Construction Manager",
      "Site Engineer", "Quantity Surveyor", "Architect", "Urban Planner",
      "Land Surveyor", "Geotechnical Engineer",
    ],
  },
  {
    category: "Agriculture & Environment",
    professions: [
      "Farmer", "Agricultural Officer", "Agronomist", "Horticulturalist",
      "Animal Scientist", "Veterinarian", "Fisheries Officer", "Forestry Officer",
      "Wildlife Conservation Officer", "Environmental Officer",
      "Climate Change Specialist", "Agricultural Extension Officer",
      "Food Scientist", "Agricultural Economist", "Soil Scientist",
    ],
  },
  {
    category: "Government & Public Service",
    professions: [
      "Civil Servant", "Government Officer", "Policy Analyst", "Diplomat",
      "Customs Officer", "Immigration Officer", "Police Officer", "Military Officer",
      "Fire Fighter", "Tax Officer", "Revenue Officer", "Public Administrator",
      "Social Welfare Officer", "Community Development Officer",
      "District Commissioner", "Minister", "Senator", "Parliamentarian",
    ],
  },
  {
    category: "Law & Legal",
    professions: [
      "Lawyer", "Attorney", "Advocate", "Legal Counsel", "Judge", "Magistrate",
      "Prosecutor", "Public Defender", "Legal Researcher", "Paralegal",
      "Notary Public", "Compliance Officer", "Legal Assistant", "Court Clerk",
      "Human Rights Officer", "Mediator", "Arbitrator",
    ],
  },
  {
    category: "Media & Communications",
    professions: [
      "Journalist", "Reporter", "News Anchor", "Radio Presenter", "TV Producer",
      "Film Director", "Filmmaker", "Photographer", "Videographer",
      "Content Creator", "YouTuber", "Podcaster", "Social Media Manager",
      "Digital Marketer", "SEO Specialist", "Public Relations Officer",
      "Communications Manager", "Copywriter", "Editor", "Publisher",
      "Translator", "Community Manager", "Brand Manager",
    ],
  },
  {
    category: "NGO & Development",
    professions: [
      "NGO Program Officer", "Development Worker", "Humanitarian Worker",
      "Field Officer", "Monitoring and Evaluation Officer", "Grant Writer",
      "Fundraising Officer", "Project Manager", "Community Organizer",
      "Advocacy Officer", "Child Protection Officer", "Gender Officer",
      "Livelihood Officer", "Emergency Response Officer", "Volunteer Coordinator",
      "Peacebuilding Officer",
    ],
  },
  {
    category: "Creative Arts & Culture",
    professions: [
      "Artist", "Painter", "Sculptor", "Illustrator", "Animator", "Musician",
      "Singer", "Music Producer", "Sound Engineer", "DJ", "Actor", "Dancer",
      "Choreographer", "Fashion Designer", "Interior Designer", "Event Planner",
      "Wedding Planner", "Art Director", "Creative Director", "Writer",
      "Author", "Poet", "Novelist", "Screenwriter",
    ],
  },
  {
    category: "Construction & Trades",
    professions: [
      "Mason", "Bricklayer", "Carpenter", "Plumber", "Electrician",
      "Welder", "Mechanic", "Auto Technician", "HVAC Technician",
      "Construction Worker", "Foreman", "Site Supervisor", "Painter",
      "Tiler", "Roofer", "Glazier",
    ],
  },
  {
    category: "Hospitality & Service",
    professions: [
      "Hotel Manager", "Chef", "Cook", "Waiter", "Waitress", "Bartender",
      "Tour Guide", "Travel Agent", "Flight Attendant", "Pilot",
      "Security Officer", "Hairdresser", "Barber", "Beautician",
      "Nail Technician", "Fitness Trainer", "Personal Trainer",
    ],
  },
  {
    category: "Science & Research",
    professions: [
      "Biologist", "Chemist", "Physicist", "Geologist", "Mathematician",
      "Statistician", "Marine Biologist", "Microbiologist", "Biochemist",
      "Botanist", "Zoologist", "Laboratory Scientist", "Clinical Scientist",
      "Forensic Scientist", "Meteorologist",
    ],
  },
  {
    category: "Freelance & Other",
    professions: [
      "Freelancer", "Consultant", "Independent Contractor", "Self-Employed",
      "Unemployed", "Job Seeker", "Homemaker", "Retired", "Volunteer", "Other",
    ],
  },
];

export const ALL_PROFESSIONS: string[] = PROFESSION_CATEGORIES.flatMap(c => c.professions);

export function searchProfessions(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ALL_PROFESSIONS.filter(p => p.toLowerCase().includes(q)).slice(0, 12);
}
