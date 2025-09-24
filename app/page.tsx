import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Brain, FileText, Zap } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuthHeader } from "@/components/auth-header"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/chat")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">CheatSheet Creator</span>
          </div>
          <AuthHeader />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            AI-Powered Job Preparation
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6">
            Turn Job Postings into
            <span className="text-primary"> Study Guides</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto leading-relaxed">
            Paste any job description and get an AI-generated cheat sheet with all the key skills, topics, and knowledge
            areas you need to master for the role.
          </p>

          <div className="flex justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                Create Your First Cheat Sheet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to create your personalized study guide
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-card border-border/40">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>1. Paste Job Description</CardTitle>
              <CardDescription>Copy and paste any job posting into our AI-powered analyzer</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border/40">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>2. AI Analysis</CardTitle>
              <CardDescription>
                Our AI identifies key skills, technologies, and knowledge areas required
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border/40">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>3. Get Your Cheat Sheet</CardTitle>
              <CardDescription>
                Download a professionally formatted PDF study guide tailored to the role
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who are using AI to prepare smarter, not harder.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                Start Creating Cheat Sheets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 CheatSheet Creator. Built with AI for job seekers.</p>
        </div>
      </footer>
    </div>
  )
}
