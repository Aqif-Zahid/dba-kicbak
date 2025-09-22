import { HeroSection } from "../components/home/hero-section";
import { Header } from "../components/layout/header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
    </div>
  );
}
