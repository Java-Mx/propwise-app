import { useTheme } from "@/lib/theme";

// Centralized chart palette that follows the active theme.
// Charts call useChartTheme() so they re-render with the right colors
// whenever the user switches Light / Dark / System.
export function useChartTheme() {
  const { effective } = useTheme();
  const dark = effective === "dark";
  return {
    // Dark mode = graphite/charcoal system, teal only as accent.
    grid: dark ? "#202832" : "#E1E7EE",
    axis: dark ? "#929DAC" : "#718096",
    text: dark ? "#B7C0CC" : "#52627A",
    tooltipBg: dark ? "#111820" : "#FFFFFF",
    tooltipBorder: dark ? "#2A3540" : "#E1E7EE",
    tooltipText: dark ? "#F4F7F7" : "#18233A",
    series: {
      value: dark ? "#A8BAD2" : "#18233A",     // Property value — light graphite-blue
      loan: dark ? "#68778D" : "#52627A",      // Loan balance — muted slate
      equity: dark ? "#4FA89B" : "#2F8F83",    // Equity — teal (prominent accent)
      emi: dark ? "#A8BAD2" : "#18233A",
      maintenance: dark ? "#68778D" : "#52627A",
      other: dark ? "#7E8998" : "#718096",
      warn: dark ? "#D7A04A" : "#C58B32",
      err: dark ? "#D47777" : "#B95C5C",
      ok: dark ? "#4FA89B" : "#2F8F6B",
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