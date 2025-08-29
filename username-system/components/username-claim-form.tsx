"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ValidationResult {
  isValid: boolean
  message: string
}

export function UsernameClaimForm() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRequirements, setShowRequirements] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const validateUsername = (value: string): ValidationResult => {
    if (value.length < 3) {
      return { isValid: false, message: "Username must be at least 3 characters long" }
    }
    if (value.length > 20) {
      return { isValid: false, message: "Username must be 20 characters or less" }
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return { isValid: false, message: "Username can only contain letters, numbers, hyphens, and underscores" }
    }
    if (/^[_-]/.test(value) || /[_-]$/.test(value)) {
      return { isValid: false, message: "Username cannot start or end with hyphens or underscores" }
    }
    return { isValid: true, message: "Username looks good!" }
  }

  const checkUsernameAvailability = async (value: string) => {
    if (!value || !validateUsername(value).isValid) return

    setIsChecking(true)
    try {
      console.log("[v0] Checking username availability for:", value)
      const response = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`)

      if (!response.ok) {
        console.log("[v0] Response not ok:", response.status, response.statusText)
        const errorText = await response.text()
        console.log("[v0] Error response body:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Username check response:", data)

      if (!data.valid) {
        setValidation({ isValid: false, message: data.message })
      } else if (data.available) {
        setValidation({ isValid: true, message: data.message })
      } else {
        setValidation({ isValid: false, message: data.message })
      }
    } catch (err) {
      console.error("[v0] Error checking username:", err)
      setValidation({ isValid: false, message: "Error checking username availability. Please try again." })
    } finally {
      setIsChecking(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setError(null)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const localValidation = validateUsername(value)
    if (!localValidation.isValid) {
      setValidation(localValidation)
      setIsChecking(false)
      setShowRequirements(true)
      return
    } else {
      setShowRequirements(false)
    }

    if (value.length >= 3) {
      setIsChecking(true)
      setValidation(null)

      debounceTimerRef.current = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 800)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleClaimUsername = async () => {
    console.log("[v0] Button clicked - claiming username:", username)

    if (!username || !validation?.isValid) {
      setError("Please enter a valid username")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      localStorage.setItem("claimedUsername", username)
      console.log("[v0] Navigating to signup page")
      window.location.href = `/auth/sign-up?username=${encodeURIComponent(username)}`
    } catch (err) {
      console.error("Error proceeding to signup:", err)
      setError("Failed to proceed to signup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      console.log("[v0] Enter pressed - ignoring, user must click button")
    }
  }

  return (
    <div className="text-center">
      <div className="mb-8 relative">
        <h2 className="text-3xl font-bold text-pink-500 mb-4" style={{ fontFamily: "cursive" }}>
          Reserve Your Username!
        </h2>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-x-8">
          <svg width="60" height="40" viewBox="0 0 60 40" className="text-pink-500">
            <path
              d="M10 10 Q30 30 50 15"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
        <div className="relative flex-1 max-w-md">
          <Input
            id="username"
            type="text"
            placeholder=""
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 text-lg border-2 border-gray-300 rounded-l-lg rounded-r-none focus:border-pink-500 focus:ring-0 pr-10"
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isChecking && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
            {!isChecking &&
              validation &&
              (validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleClaimUsername}
          className="h-12 px-8 bg-pink-500 hover:bg-pink-600 text-white font-medium text-lg rounded-r-lg rounded-l-none border-0"
          disabled={isLoading || !validation?.isValid || isChecking}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Claiming...
            </>
          ) : (
            "Claim Your Username"
          )}
        </Button>
      </div>

      <p className="text-gray-500 mt-3 text-sm">(before someone else does)</p>

      {validation && (
        <p className={`text-sm mt-3 ${validation.isValid ? "text-green-600" : "text-red-600"}`}>{validation.message}</p>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {showRequirements && (
        <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-3 rounded-lg">
          <p className="font-medium mb-1">Username requirements:</p>
          <ul className="space-y-1 text-left">
            <li>• 3-20 characters long</li>
            <li>• Letters, numbers, hyphens, and underscores only</li>
            <li>• Cannot start or end with hyphens or underscores</li>
          </ul>
        </div>
      )}
    </div>
  )
}
