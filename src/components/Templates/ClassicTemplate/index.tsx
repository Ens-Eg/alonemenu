"use client";

import React from "react";
import { AdSpace } from "./components/AdSpace";
import { Navbar } from "./components/Navbar";
import { QRCodeSection } from "./components/QRCodeSection";
import { TemplatesSection } from "./components/TemplatesSection";
import { Footer } from "./components/Footer";

function ClassicTemplateLanding() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <AdSpace position="left" />
      <AdSpace position="right" />

      <Navbar />
      <main>
        <TemplatesSection />
        <QRCodeSection />
      </main>
      <Footer />
    </div>
  );
}

export default ClassicTemplateLanding;
