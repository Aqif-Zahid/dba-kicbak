"use client"

import Image from "next/image"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { useState } from "react"

export default function HomePage() {
  const { isSignedIn, user } = useUser()
  const [username, setUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const checkUsername = async () => {
    if (!username.trim()) return

    setIsChecking(true)
    // Simulate username availability check
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAvailable(Math.random() > 0.3) // 70% chance available
    setIsChecking(false)
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <Image src="/kicbak-logo.png" alt="Kicbak" width={200} height={60} className="h-12 w-auto" />
            <UserButton />
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
            <p className="text-muted-foreground">Your Kicbak account is ready to go.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Image src="/kicbak-logo.png" alt="Kicbak" width={200} height={60} className="h-12 w-auto" />
          <div className="flex gap-4">
            <SignInButton mode="modal">
              <button className="text-foreground hover:text-primary transition-colors">Sign In</button>
            </SignInButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Claim Your Username
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure your unique identity on Kicbak before someone else does.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <input
                  type="text"
                  placeholder="your-username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    setIsAvailable(null)
                  }}
                  className="w-full pl-8 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={checkUsername}
                disabled={!username.trim() || isChecking}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? "Checking..." : "Check"}
              </button>
            </div>

            {isAvailable !== null && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  isAvailable
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {isAvailable ? `@${username} is available! 🎉` : `@${username} is already taken. Try another one.`}
              </div>
            )}

            {isAvailable && (
              <SignUpButton mode="modal">
                <button className="w-full bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Claim @{username}
                </button>
              </SignUpButton>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <SignInButton mode="modal">
              <button className="text-primary hover:underline">Sign in here</button>
            </SignInButton>
          </div>
        </div>
      </main>
    </div>
  )
}
