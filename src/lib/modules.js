import {
  Home, ShieldCheck, Calculator, Clock, TrendingUp,
  Wallet, CalendarDays, CalendarRange, Receipt, PieChart,
  User, Scale, Hourglass, Banknote, Percent, ListChecks, ArrowLeftRight,
  LineChart, Table, GitCompare, Building2,
  Plus, FolderOpen, Save, Download, Settings as SettingsIcon, Info,
} from "lucide-react";

// Analysis modules — each is a distinct tool/view.
export const MODULES = {
  // Affordability
  setup: { key: "setup", group: "affordability", label: "Property & Loan Setup", desc: "Enter the core assumptions that drive every calculation.", icon: Home, route: "/analysis/affordability" },
  check: { key: "check", group: "affordability", label: "Affordability Check", desc: "See if you can reasonably handle this property.", icon: ShieldCheck, route: "/analysis/affordability" },
  emi: { key: "emi", group: "affordability", label: "EMI Simulator", desc: "Test loan assumptions without changing your analysis.", icon: Calculator, route: "/analysis/affordability" },
  payoff: { key: "payoff", group: "affordability", label: "Loan Payoff Explorer", desc: "See how extra payments shorten your loan.", icon: Clock, route: "/analysis/affordability" },
  future: { key: "future", group: "affordability", label: "Future Property Value", desc: "Project the property's value over time.", icon: TrendingUp, route: "/analysis/affordability" },

  // Property Costs
  builder: { key: "builder", group: "costs", label: "Cost Builder", desc: "Add and categorize every property cost.", icon: Wallet, route: "/analysis/property-costs" },
  monthly: { key: "monthly", group: "costs", label: "Monthly Cost Analyzer", desc: "What will this property cost each month?", icon: CalendarDays, route: "/analysis/property-costs" },
  annual: { key: "annual", group: "costs", label: "Annual Cost Analyzer", desc: "See the yearly ownership burden.", icon: CalendarRange, route: "/analysis/property-costs" },
  onetime: { key: "onetime", group: "costs", label: "One-Time Cost Calculator", desc: "Total your upfront purchase expenses.", icon: Receipt, route: "/analysis/property-costs" },
  breakdown: { key: "breakdown", group: "costs", label: "Ownership Cost Breakdown", desc: "See where every rupee goes.", icon: PieChart, route: "/analysis/property-costs" },

  // Investment
  profile: { key: "profile", group: "investment", label: "Buyer Profile", desc: "What type of buyer does this suit?", icon: User, route: "/analysis/investment" },
  commitment: { key: "commitment", group: "investment", label: "Financial Commitment", desc: "Map income, obligations and property cost.", icon: Scale, route: "/analysis/investment" },
  horizon: { key: "horizon", group: "investment", label: "Investment Horizon", desc: "Project outcomes over 3–20 years.", icon: Hourglass, route: "/analysis/investment" },
  "rental-income": { key: "rental-income", group: "investment", label: "Rental Income", desc: "Estimate gross to net rental income.", icon: Banknote, route: "/analysis/investment" },
  "rental-yield": { key: "rental-yield", group: "investment", label: "Rental Yield", desc: "Measure annual rent against value.", icon: Percent, route: "/analysis/investment" },
  "rental-costs": { key: "rental-costs", group: "investment", label: "Rental Costs", desc: "Manage rental expenses.", icon: ListChecks, route: "/analysis/investment" },
  "net-benefit": { key: "net-benefit", group: "investment", label: "Net Rental Benefit", desc: "How much rent offsets your cost.", icon: ArrowLeftRight, route: "/analysis/investment" },
  "value-projection": { key: "value-projection", group: "investment", label: "Property Value Projection", desc: "Animated value growth chart.", icon: LineChart, route: "/analysis/investment" },
  equity: { key: "equity", group: "investment", label: "Equity Growth", desc: "Value minus remaining loan over time.", icon: TrendingUp, route: "/analysis/investment" },
  yearly: { key: "yearly", group: "investment", label: "Yearly Investment Analysis", desc: "Year-by-year position table.", icon: Table, route: "/analysis/investment" },
  scenario: { key: "scenario", group: "investment", label: "Scenario Comparison", desc: "Compare two strategies side by side.", icon: GitCompare, route: "/analysis/investment" },
  "property-compare": { key: "property-compare", group: "investment", label: "Property Comparison", desc: "Compare up to 3 properties.", icon: Building2, route: "/analysis/investment" },
};

export const GROUPS = {
  affordability: { key: "affordability", label: "Affordability", tagline: "Can I handle this?", route: "/analysis/affordability" },
  costs: { key: "costs", label: "Property Costs", tagline: "What will I actually spend?", route: "/analysis/property-costs" },
  investment: { key: "investment", label: "Investment", tagline: "What happens over time?", route: "/analysis/investment" },
};

export const moduleList = (group) => Object.values(MODULES).filter((m) => m.group === group);

// Tools are actions (not page modules) — managed in header.
export const TOOL_ACTIONS = [
  { key: "new", label: "New Analysis", desc: "Start a blank analysis.", icon: Plus },
  { key: "saved", label: "Saved Analyses", desc: "Open, duplicate, rename or delete.", icon: FolderOpen },
  { key: "save", label: "Save Analysis", desc: "Save the current state.", icon: Save },
  { key: "export", label: "Export Report", desc: "Download a full analysis report.", icon: Download },
  { key: "settings", label: "Settings", desc: "Name and defaults.", icon: SettingsIcon },
  { key: "help", label: "Help & Information", desc: "How PropWise works.", icon: Info },
];