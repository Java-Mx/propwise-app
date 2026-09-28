import React from "react";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import Hero from "@/components/propwise/home/Hero";
import CalculationJourney from "@/components/propwise/home/CalculationJourney";
import WhyPropWise from "@/components/propwise/home/WhyPropWise";
import ThreeAreas from "@/components/propwise/home/ThreeAreas";
import HowItWorks from "@/components/propwise/home/HowItWorks";
import WhatItCalculates from "@/components/propwise/home/WhatItCalculates";
import FinalCTA from "@/components/propwise/home/FinalCTA";
import Footer from "@/components/propwise/home/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-pagebg text-ink">
      <PropWiseHeader />
      <main>
        <Hero />
        <CalculationJourney />
        <WhyPropWise />
        <ThreeAreas />
        <HowItWorks />
        <WhatItCalculates />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}