import { useTheme } from "@/lib/theme";

// Centralized chart palette that follows the active theme.
// Charts call useChartTheme() so they re-render with the right colors
// whenever the user switches Light / Dark / System.
export function useChartTheme() {
  const { effective } = useTheme();
  const dark = effective === "dark";
  return {
    grid: dark ? "#263548" : "#E1E7EE",
    axis: dark ? "#77869A" : "#718096",
    text: dark ? "#A9B6C7" : "#52627A",
    tooltipBg: dark ? "#0D1624" : "#FFFFFF",
    tooltipBorder: dark ? "#253548" : "#E1E7EE",
    tooltipText: dark ? "#F4F7FB" : "#18233A",
    series: {
      value: dark ? "#8FA8C7" : "#18233A",     // Property value — navy
      loan: dark ? "#718096" : "#52627A",      // Loan balance — slate
      equity: dark ? "#49A99A" : "#2F8F83",    // Equity — teal (prominent)
      emi: dark ? "#8FA8C7" : "#18233A",
      maintenance: dark ? "#718096" : "#52627A",
      other: dark ? "#A9B6C7" : "#718096",
      warn: dark ? "#D7A04A" : "#C58B32",
      err: dark ? "#D47777" : "#B95C5C",
      ok: dark ? "#49A99A" : "#2F8F6B",
    },
  };
}

export function tooltipStyle(t) {
  return {
    borderRadius: 8,
    border: `1px solid ${t.tooltipBorder}`,
    background: t.tooltipBg,
    color: t.tooltipText,
    fontSize: 12,
  };
}