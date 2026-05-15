export interface CountryData {
  name: string;
  code: string;
  states: string[];
}

export const COUNTRIES: CountryData[] = [
  {
    name: "Liberia",
    code: "LR",
    states: [
      "Montserrado", "Margibi", "Bong", "Nimba", "Grand Bassa",
      "Maryland", "Lofa", "Bomi", "Grand Cape Mount", "Rivercess",
      "River Gee", "Sinoe", "Grand Kru", "Gbarpolu", "Grand Gedeh",
    ],
  },
  {
    name: "Sierra Leone",
    code: "SL",
    states: ["Western Area", "Northern Province", "Southern Province", "Eastern Province", "North West Province"],
  },
  {
    name: "Ghana",
    code: "GH",
    states: [
      "Greater Accra", "Ashanti", "Western", "Central", "Eastern",
      "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo",
      "Oti", "Ahafo", "Bono", "Bono East", "North East", "Savannah", "Western North",
    ],
  },
  {
    name: "Nigeria",
    code: "NG",
    states: [
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
      "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
      "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
      "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
      "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
      "Yobe", "Zamfara",
    ],
  },
  {
    name: "Kenya",
    code: "KE",
    states: [
      "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika",
      "Nyeri", "Meru", "Kakamega", "Garissa", "Kisii", "Machakos",
      "Kilifi", "Kwale", "Lamu", "Mandera", "Marsabit", "Migori",
      "Homabay", "Bungoma", "Busia", "Embu", "Isiolo", "Kajiado",
      "Kirinyaga", "Kitui", "Laikipia", "Makueni", "Murang'a", "Nandi",
      "Nyandarua", "Samburu", "Siaya", "Tana River", "Tharaka-Nithi",
      "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
    ],
  },
  {
    name: "South Africa",
    code: "ZA",
    states: [
      "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
      "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
    ],
  },
  {
    name: "United States",
    code: "US",
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
      "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
      "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
      "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
      "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming", "Washington D.C.",
    ],
  },
  {
    name: "United Kingdom",
    code: "GB",
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
  },
  {
    name: "Canada",
    code: "CA",
    states: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick",
      "Newfoundland and Labrador", "Nova Scotia", "Ontario",
      "Prince Edward Island", "Quebec", "Saskatchewan",
      "Northwest Territories", "Nunavut", "Yukon",
    ],
  },
  {
    name: "Germany",
    code: "DE",
    states: [
      "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen",
      "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern",
      "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland",
      "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia",
    ],
  },
  {
    name: "France",
    code: "FR",
    states: [
      "Île-de-France", "Nouvelle-Aquitaine", "Occitanie", "Auvergne-Rhône-Alpes",
      "Hauts-de-France", "Grand Est", "Normandie", "Pays de la Loire",
      "Bretagne", "Bourgogne-Franche-Comté", "Centre-Val de Loire",
      "Provence-Alpes-Côte d'Azur", "Corse",
    ],
  },
  {
    name: "Cameroon",
    code: "CM",
    states: [
      "Adamawa", "Centre", "East", "Far North", "Littoral",
      "North", "Northwest", "South", "Southwest", "West",
    ],
  },
  {
    name: "Côte d'Ivoire",
    code: "CI",
    states: [
      "Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro",
      "Divo", "Korhogo", "Man", "Gagnoa", "Abengourou",
    ],
  },
  {
    name: "Senegal",
    code: "SN",
    states: [
      "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack",
      "Kédougou", "Kolda", "Louga", "Matam", "Saint-Louis",
      "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor",
    ],
  },
  {
    name: "Ethiopia",
    code: "ET",
    states: [
      "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz",
      "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama",
      "Somali", "South Ethiopia", "SNNPR", "Tigray",
    ],
  },
  {
    name: "Tanzania",
    code: "TZ",
    states: [
      "Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya",
      "Morogoro", "Tanga", "Zanzibar", "Kagera", "Kigoma",
    ],
  },
  {
    name: "Rwanda",
    code: "RW",
    states: ["Kigali", "Eastern Province", "Western Province", "Northern Province", "Southern Province"],
  },
  {
    name: "Uganda",
    code: "UG",
    states: [
      "Central Region", "Eastern Region", "Northern Region", "Western Region",
      "Kampala", "Wakiso", "Mukono", "Gulu", "Mbarara",
    ],
  },
  {
    name: "India",
    code: "IN",
    states: [
      "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Gujarat",
      "Haryana", "Karnataka", "Kerala", "Madhya Pradesh",
      "Maharashtra", "Odisha", "Punjab", "Rajasthan",
      "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
    ],
  },
  {
    name: "China",
    code: "CN",
    states: [
      "Beijing", "Shanghai", "Guangdong", "Zhejiang", "Jiangsu",
      "Shandong", "Sichuan", "Hubei", "Hunan", "Fujian",
    ],
  },
  { name: "Other", code: "OT", states: [] },
];

export const COUNTRY_NAMES = COUNTRIES.map(c => c.name);

export function getStatesForCountry(countryName: string): string[] {
  const country = COUNTRIES.find(c => c.name === countryName);
  return country?.states ?? [];
}

// Cities for Liberia counties
export const LIBERIA_CITIES: Record<string, string[]> = {
  Montserrado: ["Monrovia", "Paynesville", "Brewerville", "Gardnersville", "Sinkor", "Congo Town", "New Kru Town", "Red Light"],
  Margibi: ["Kakata", "Harbel", "Firestone", "Margibi"],
  Bong: ["Gbarnga", "Suakoko", "Salala"],
  Nimba: ["Sanniquellie", "Ganta", "Yekepa", "Tappita"],
  "Grand Bassa": ["Buchanan", "Edina", "Binatown"],
  Maryland: ["Harper", "Pleebo", "Barrobo"],
  Lofa: ["Voinjama", "Kolahun", "Foya", "Zorzor"],
  Bomi: ["Tubmanburg", "Suehn", "Klay"],
};

export function getCitiesForState(countryName: string, stateName: string): string[] {
  if (countryName === "Liberia") {
    return LIBERIA_CITIES[stateName] ?? [];
  }
  return [];
}
