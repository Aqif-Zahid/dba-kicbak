"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefitData = {
  Travelers: [
    "Earn Tips for Sharing Travel Advice: Get paid tips for helping others with your travel advice.",
    "Train Your AI Travel Agent: Get your own travel AI agent trained on your preferences to help you find and book travel.",
    "Get Better Rewards for Booking Direct: Get up to 20%+ cashback when you book direct via Kicbak.",
    "Earn Higher Status: Get higher cashback % the more your travel and help the community.",
    "Ultimate Travel Savings Account: Save up for travel with your own travel savings account and get bonus deposits from travel suppliers and destinations that boost your.",
    "Get Personalized Offers: Get personalized offers from travel sellers based on your preferences.",
    "Get Expert Travel Advice: Get experts advice from our community of travel experts and locals from around the world.",
  ],
  Suppliers: ["Supplier Benefit 1", "Supplier Benefit 2"], // Example data
  "Creators & Affiliates": ["Creator Benefit 1", "Creator Benefit 2"],
  "Agents & Advisors": ["Agent Benefit 1", "Agent Benefit 2"],
  "Tech & Ecosystem Partners": ["Tech Benefit 1", "Tech Benefit 2"],
};

// Define a type for the keys of the benefitData object
type TabKey = keyof typeof benefitData;

export function TravelBenefits() {
  // State to track the active tab, defaulting to 'Travelers'
  const [activeTab, setActiveTab] = useState<TabKey>("Travelers");

  return (
    <Card className="w-full max-w-4xl p-8 mx-auto shadow-lg bg-gray-100 mb-40">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          Which are you? See how you benefit
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.keys(benefitData).map((tab) => (
            <Button
              key={tab}
              variant="outline"
              onClick={() => setActiveTab(tab as TabKey)}
              className={`
                px-6 py-3 rounded-lg text-lg font-semibold
                ${
                  activeTab === tab
                    ? "bg-gray-800 text-white"
                    : "bg-gray-300 text-gray-800"
                }
              `}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Content Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">{activeTab} Benefits</h2>
          <ul className="space-y-4">
            {benefitData[activeTab].map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-xl">•</span>
                <p className="text-gray-700 leading-relaxed">
                  <strong className="font-semibold">
                    {benefit.split(": ")[0]}
                  </strong>
                  : {benefit.split(": ")[1]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
