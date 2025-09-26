import { TravelBenefits } from "@/components/home/traveler-benefits";
import { HeroSection } from "../components/home/hero-section";
import { Layout } from "@/components/layout/layout";

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <TravelBenefits />
    </Layout>
  );
}
