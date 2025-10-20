"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

//  Inlined JSON data
const benefitData = {
  titles: {
    Travelers: "Travelers Benefits",
    Suppliers:
      "Travel Suppliers (tours & experiences, hotels, short term vacation rentals, etc)",
    "Creators & Affiliates":
      "Travel Creators & Marketers (travel creators, communities, websites, apps, platforms, etc)",
    "Agents & Advisors": "Travel Agents & Advisors",
    "Tech & Ecosystem Partners":
      "Travel Tech & Ecosystem Partners (B2C & B2B travel businesses)",
  },

  Travelers: [
    "Earn Tips for Sharing Travel Advice: Get paid tips for helping others with your travel advice.",
    "Train Your AI Travel Agent: Get your own travel AI agent trained on your preferences to help you find and book travel.",
    "Get Better Rewards for Booking Direct: Get up to 20%+ cashback when you book direct via Kicbak.",
    "Earn Higher Status: Get higher cashback % the more your travel and help the community.",
    "Ultimate Travel Savings Account: Save up for travel with your own travel savings account and get bonus deposits from travel suppliers and destinations that boost your.",
    "Get Personalized Offers: Get personalized offers from travel sellers based on your preferences.",
    "Get Expert Travel Advice: Get experts advice from our community of travel experts and locals from around the world.",
  ],

  Suppliers: [
    "Get Access to All Our Travelers: Access our community of travelers who book direct.",
    "Get Direct Bookings: Boost your direct bookings and take back customers and control from OTAs.",
    "Own Your Guests: Own the guest relationship and contact info.",
    "Get Repeat Guests: Get repeat guests who book direct.",
    "Your Own Loyalty Program: Customize your own direct-booking loyalty rewards program.",
    "Boost Your Direct Booking Conversions: Convert your website visitors from lookers to bookers.",
    "You Get a New Revenue Stream: Turn past guests who don’t return into a new revenue stream.",
    "Build Your Brand: Build your audience of travelers and gain fans.",
    "Extend Your Marketing: Get promoted by travel creators, travel agents/advisors, and others.",
    "Get Included in AI Search: Get your brand and bookable inventory included in AI agent searches and search engine optimization.",
    "Earn Tips for Sharing Advice: Get paid tips for helping others with your travel advice.",
  ],

  "Creators & Affiliates": [
    "Forever Revenue Stream: The industry’s best affiliate program. Introduce travelers to Kicbak and earn whenever they book and every time they book, forever.",
    "Own Your Audience: Move your followers off socials and own them on Kicbak, with full access to engage them directly, without algorithms limiting your reach.",
    "Get Paid Sponsorships: Get paid for sponsored collaborations with travel businesses.",
    "Get Free & Discounted Travel: Get free and discounted travel based on your content and status.",
    "Earn Tips for Sharing Advice: Get paid tips for helping others with your travel content and advice.",
  ],

  "Agents & Advisors": [
    "Get Access to All Our Travelers: Engage with our community of travelers for free and convert them into your customers.",
    "Forever Revenue Stream: Introduce travelers to Kicbak and earn the industry’s best revenue share whenever they book and every time they book, forever.",
    "Build Your Brand: Build your audience of travelers and gain fans.",
    "Get Included in AI Search: Get your name into AI agent searches and search engine optimization.",
    "Get Paid for Travel Advice: Get paid for helping others with their travel questions and plans.",
  ],

  "Tech & Ecosystem Partners": [
    "Get Access to All Our Travelers and/or Travel Suppliers",
    "Build & Own Your Community on Our Platform",
    "Grow Your Brand to Travelers and/or Travel Suppliers",
    "Support the Direct Booking Ecosystem",
  ],
};

//  Strong typing for tab keys
type TitlesMap = typeof benefitData.titles;
type TabKey = keyof TitlesMap;

// Build tab keys & entries with correct types
const tabKeys = Object.keys(benefitData.titles) as TabKey[];
const benefitEntries: Array<[TabKey, string[]]> = tabKeys.map((tab) => [
  tab,
  benefitData[tab] as string[],
]);

export function Benefits() {
  const [activeTab, setActiveTab] = useState<TabKey>(tabKeys[0]);

  return (
    <Card className="w-full max-w-5xl p-6 mx-auto shadow-lg bg-gray-50 mb-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          Which are you? See how you benefit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={tabKeys[0]}
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabKey)}
          className="w-full"
        >
          {/* Sticky Scrollable Tab List */}
          <div className="sticky top-0 z-10 bg-gray-50 py-2">
            <div className="overflow-x-auto">
              <TabsList className="flex w-max min-w-full gap-2 rounded-lg bg-gray-200 p-6 shadow-sm">
                {tabKeys.map((tab) => (
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
              {benefitEntries.map(([tab, benefits]) => {
                if (activeTab !== tab) return null;

                // Pre-split the title text
                const title = benefitData.titles[tab];
                const hasBracket = title.includes("(");
                const [mainTitle, bracketPart] = hasBracket
                  ? title.split("(")
                  : [title, ""];

                return (
                  <TabsContent key={tab} value={tab} forceMount>
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">
                        {mainTitle.trim()}
                        {hasBracket && (
                          <span className="text-base font-normal text-gray-600">
                            ({bracketPart}
                          </span>
                        )}
                      </h2>

                      <ul className="space-y-4">
                        {benefits.map((benefit: string, index: number) => {
                          const [benefitTitle, benefitDesc] = benefit.split(": ");
                          return (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 text-xl text-[oklch(0.64_0.25_13.47)]">
                                •
                              </span>
                              <p className="text-gray-700 leading-relaxed">
                                <strong className="font-semibold">
                                  {benefitTitle}
                                </strong>
                                {benefitDesc ? `: ${benefitDesc}` : ""}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  </TabsContent>
                );
              })}
            </AnimatePresence>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
