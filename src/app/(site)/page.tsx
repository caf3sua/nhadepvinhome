import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { FundMapSection } from "@/components/map/FundMapSection";
import {
  ApartmentTableSection,
  BigButtons,
  HotUnitsSection,
  IntroSection,
  LifeStrip,
  ProjectsGrid,
  TwoProjectsSection,
} from "@/components/home/HomeSections";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FundMapSection />
      <BigButtons />
      <ProjectsGrid />
      <IntroSection />
      <LifeStrip />
      <HotUnitsSection />
      <ApartmentTableSection />
      <TwoProjectsSection />
    </>
  );
}
