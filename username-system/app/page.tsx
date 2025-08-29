"use client"

import { UsernameClaimForm } from "@/components/username-claim-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="bg-pink-500 text-white px-3 py-1 rounded font-bold text-lg">
            kicbak<span className="text-xs align-super">™</span>
          </div>
        </div>
        <button className="border-2 border-pink-500 text-pink-500 px-6 py-2 rounded-full font-medium hover:bg-pink-50 transition-colors">
          Join the Waitlist
        </button>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Kicbak cuts out the travel middlemen and gives you their commission.
            </h1>
            <div className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              <p>
                Kicbak™ is a peer-to-peer <strong>travel marketplace + community</strong> where everyone is rewarded
                when travelers <strong>book direct</strong>. We kick 100% of the commissions back to you, the members.
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <UsernameClaimForm />
          </div>
        </div>
      </div>
    </div>
  )
}
