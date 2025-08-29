import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kicbak</h1>
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Welcome to Kicbak</h2>
            <p className="text-xl text-muted-foreground">Your secure application powered by Clerk authentication</p>
          </div>

          <SignedOut>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Sign in to access your personalized dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <SignInButton mode="modal">
                  <Button className="w-full" size="lg">
                    Sign In to Continue
                  </Button>
                </SignInButton>
              </CardContent>
            </Card>
          </SignedOut>

          <SignedIn>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>You're successfully signed in to Kicbak</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  Go to Dashboard
                </Button>
                <p className="text-sm text-muted-foreground">Explore your personalized experience</p>
              </CardContent>
            </Card>
          </SignedIn>
        </div>
      </main>
    </div>
  )
}
