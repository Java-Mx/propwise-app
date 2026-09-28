import { useTheme } from "@/lib/theme";

// Centralized chart palette that follows the active theme.
// Charts call useChartTheme() so they re-render with the right colors
// whenever the user switches Light / Dark / System.
export function useChartTheme() {
  const { effective } = useTheme();
  const dark = effective === "dark";
  return {
    grid: dark ? "#2B3A4A" : "#E2E7EF",
    axis: dark ? "#7F8D9D" : "#718096",
    text: dark ? "#AEBBC9" : "#52627A",
    tooltipBg: dark ? "#1D2A38" : "#FFFFFF",
    tooltipBorder: dark ? "#2B3A4A" : "#E2E7EF",
    tooltipText: dark ? "#F4F7FA" : "#172033",
    series: {
      value: dark ? "#8FA8C7" : "#18233A",     // Property value — navy
      loan: dark ? "#7F8D9D" : "#52627A",       // Loan balance — muted slate
      equity: dark ? "#49A99A" : "#2F8F83",     // Equity — teal (prominent)
      emi: dark ? "#8FA8C7" : "#18233A",
      maintenance: dark ? "#7F8D9D" : "#52627A",
      other: dark ? "#AEBBC9" : "#718096",
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