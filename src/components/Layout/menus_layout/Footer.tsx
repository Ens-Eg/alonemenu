"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#0c1427] border-t border-gray-200 dark:border-[#172036] mt-auto">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()}{" "}
            <span className="text-primary-600 dark:text-primary-500 font-semibold">
              SaaS Menu
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
