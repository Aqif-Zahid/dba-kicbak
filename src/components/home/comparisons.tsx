"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ACCENT = "text-[oklch(0.64_0.25_13.47)]"; 
const ACCENT_BG = "bg-rose-50";                

type Section = {
  title: string;
  left: string[];
  right: string[];
};

const header = {
  left: { label: "old model", title: "Middlemen (OTA) jerks" },
  right: { label: "new model", title: "Kicbak™" },
};

const sections: Section[] = [
  {
    title: "Travelers",
    left: ["Travelers earn low to moderate rewards"],
    right: [
      "Travelers earn the industry's highest rewards %, up to 95% of the commission",
    ],
  },
  {
    title: "Travel Suppliers",
    left: [
      "Travel Suppliers pay commission to the middlemen",
      "Middlemen own the customer relationship and the data",
    ],
    right: [
      "Travel Suppliers pay peer-to-peer rewards to Travelers & Referrers",
      "Travel Suppliers own the customer relationship and data",
    ],
  },
  {
    title: "Creators & Affiliates",
    left: [
      "Affiliate-model: Earn a one-time commission if travelers you refer book travel within the cookie window (e.g. 30 days)",
      "Maximize profit for shareholders",
      "Big Travel and their Big Tech ad partners",
    ],
    right: [
      "Referral model: Own a forever revenue stream from every traveler you introduce to Kicbak, every time they book",
      "Create a fairer travel economy for travelers and travel businesses",
      "Travelers, Travel Suppliers, Travel Creators, and everyone else",
      "100% of value flows back to the community",
    ],
  },
  {
    title: "Result",
    left: ["Big Travel and Big Tech extract the value."],
    right: ["The value stays within the direct booking ecosystem."],
  },
];

function BulletList({
  items,
  bulletClass,
}: {
  items: string[];
  bulletClass: string;
}) {
  return (
    <ul className="space-y-3">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className={`text-xl leading-6 ${bulletClass}`}>•</span>
          <p className="text-gray-700 leading-relaxed">{t}</p>
        </li>
      ))}
    </ul>
  );
}

export function Comparisons() {
  return (
    <Card className="w-full max-w-5xl p-6 mx-auto shadow-lg bg-gray-50 mt-8 rounded-2xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-3xl font-bold text-center">
          Compare: <span className="text-gray-700">Middlemen (OTAs)</span> vs{" "}
          <span className={ACCENT}>Kicbak</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          {/* Header row */}
          <div className="grid grid-cols-2">
            <div className="p-5 bg-gray-100 border-r border-gray-200">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                {header.left.label}
              </div>
              <div className="text-2xl font-bold text-gray-700">
                {header.left.title}
              </div>
            </div>
            <div className={`p-5 ${ACCENT_BG}`}>
              <div className={`text-xs uppercase tracking-wide ${ACCENT} mb-1`}>
                {header.right.label}
              </div>
              <div className={`text-2xl font-bold ${ACCENT}`}>{header.right.title}</div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="border-t border-gray-200">
              {/* Section title spanning both columns */}
              <div className="bg-gray-100 px-5 py-2.5 text-gray-600 font-semibold border-b border-gray-200">
                {section.title}
              </div>

              {/* Two-column comparison */}
              <div className="grid grid-cols-2">
                <div className="p-5 bg-white border-r border-gray-200">
                  <BulletList items={section.left} bulletClass="text-gray-500" />
                </div>
                <div className={`p-5 ${ACCENT_BG}`}>
                  <BulletList items={section.right} bulletClass={ACCENT} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
