import React from "react";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import Hero from "@/components/propwise/home/Hero";
import HeroDivider from "@/components/propwise/home/HeroDivider";
import MetricsBand from "@/components/propwise/home/MetricsBand";
import DataDecision from "@/components/propwise/home/DataDecision";
import ThreeAreas from "@/components/propwise/home/ThreeAreas";
import Scenarios from "@/components/propwise/home/Scenarios";
import HowItWorks from "@/components/propwise/home/HowItWorks";
import FinalCTA from "@/components/propwise/home/FinalCTA";
import Footer from "@/components/propwise/home/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-pagebg text-ink">
      <PropWiseHeader />
      <main>
        <Hero />
        <div className="py-6"><HeroDivider /></div>
        <MetricsBand />
        <DataDecision />
        <ThreeAreas />
        <Scenarios />
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}