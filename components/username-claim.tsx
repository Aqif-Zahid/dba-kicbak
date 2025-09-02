"use client"

import { useState } from "react"
import { SignUpButton } from "@clerk/nextjs"

interface UsernameClaimProps {
  onUsernameChange?: (username: string, isAvailable: boolean) => void
}

export function UsernameClaim({ onUsernameChange }: UsernameClaimProps) {
  const [username, setUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const checkUsername = async () => {
    if (!username.trim()) return

    setIsChecking(true)
    // Simulate API call to check username availability
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const available = Math.random() > 0.3 // 70% chance available
    setIsAvailable(available)
    setIsChecking(false)

    onUsernameChange?.(username, available)
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
          <input
            type="text"
            placeholder="your-username"
            value={username}
            onChange={(e) => {
              const cleanUsername = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
              setUsername(cleanUsername)
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
              ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
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
  )
}
