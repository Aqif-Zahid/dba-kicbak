"use client";

import benefitDataJson from "@/data/benefits.json";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

// Define the expected shape of the JSON file
type BenefitData = {
  titles: Record<string, string>;
  [key: string]: string[] | Record<string, string>;
};

// Cast imported JSON to our type
const benefitData = benefitDataJson as BenefitData;
const tabKeys = Object.keys(benefitData).filter((tab) => tab !== "titles");
const benefitEntries = Object.entries(benefitData).filter(([tab]) => tab !== "titles");

export function Benefits() {
  const [activeTab, setActiveTab] = useState(tabKeys[0]);

  return (
    <Card className="w-full max-w-5xl p-6 mx-auto shadow-lg bg-gray-50 mb-40">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          Which are you? See how you benefit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={tabKeys[0]}
          value={activeTab}
          onValueChange={setActiveTab}
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
                        {(benefits as string[]).map(
                          (benefit: string, index: number) => {
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
                          }
                        )}
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
