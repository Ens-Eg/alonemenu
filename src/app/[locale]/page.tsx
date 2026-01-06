import ContactSection from "@/components/FrontPage/ContactSection";
import PricingSection from "@/components/FrontPage/PricingSection";
import WhyUsSection from "@/components/FrontPage/WhyUsSection";
import Footer from "@/components/FrontPage/Footer";
import HeroBanner from "@/components/FrontPage/HeroBanner";

import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/FrontPage/HowItWorks";
import FeaturesSection from "@/components/FrontPage/FeaturesSection";
import TrustedBy from "@/components/FrontPage/TrustedBy";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function Home() {
  return (
    <>
      <div className="front-page-body overflow-hidden">
        <Navbar />

        <HeroBanner />

        <WhyUsSection />

        <TrustedBy />

        <FeaturesSection />

        <HowItWorks />

        <PricingSection />

        <ContactSection />


        <Footer />
      </div>
    </>
  );
}
