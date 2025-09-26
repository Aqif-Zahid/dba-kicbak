"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

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
  Suppliers: ["Supplier Benefit 1", "Supplier Benefit 2"],
  "Creators & Affiliates": ["Creator Benefit 1", "Creator Benefit 2"],
  "Agents & Advisors": ["Agent Benefit 1", "Agent Benefit 2"],
  "Tech & Ecosystem Partners": ["Tech Benefit 1", "Tech Benefit 2"],
};

export function TravelBenefits() {
  const [activeTab, setActiveTab] = useState("Travelers");

  return (
    <Card className="w-full max-w-5xl p-6 mx-auto shadow-lg bg-gray-50 mb-40">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          Which are you? See how you benefit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="Travelers"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Sticky Scrollable Tab List */}
          <div className="sticky top-0 z-10 bg-gray-50 py-2">
            <div className="overflow-x-auto">
              <TabsList className="flex w-max min-w-full gap-2 rounded-lg bg-gray-200 p-6 shadow-sm">
                {Object.keys(benefitData).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-[oklch(0.64_0.25_13.47)]
                               data-[state=active]:text-white 
                               text-sm sm:text-base rounded-md p-4 whitespace-nowrap"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Tab Content with animation */}
          <div className="mt-8 min-h-[250px]">
            <AnimatePresence mode="wait">
              {Object.entries(benefitData).map(([tab, benefits]) =>
                activeTab === tab ? (
                  <TabsContent key={tab} value={tab} forceMount>
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">
                        {tab} Benefits
                      </h2>
                      <ul className="space-y-4">
                        {benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-xl text-[oklch(0.64_0.25_13.47)]">
                              •
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                              <strong className="font-semibold">
                                {benefit.split(": ")[0]}
                              </strong>
                              : {benefit.split(": ")[1]}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </TabsContent>
                ) : null
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
