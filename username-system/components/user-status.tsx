"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserData {
  email: string
  id: string
}

interface UsernameData {
  hasUsername: boolean
  username: string | null
  claimedAt: string | null
}

export function UserStatus() {
  const [user, setUser] = useState<UserData | null>(null)
  const [usernameData, setUsernameData] = useState<UsernameData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()

      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          setUser({ email: authUser.email!, id: authUser.id })

          // Fetch username data
          const response = await fetch("/api/username/me")
          if (response.ok) {
            const data = await response.json()
            setUsernameData(data)
          }
        }
      } catch (error) {
        console.error("[v0] Error checking user status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUsernameData(null)
    router.refresh()
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading user status...</div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto mb-6">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Please log in to claim your username</p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-sm">{user.email}</p>
              {usernameData?.hasUsername ? (
                <p className="text-xs text-green-600 dark:text-green-400">Username: @{usernameData.username}</p>
              ) : (
                <p className="text-xs text-gray-500">No username claimed</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
