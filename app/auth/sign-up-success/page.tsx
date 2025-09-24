import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Thank you for signing up!</CardTitle>
              <CardDescription>Check your email to confirm your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You&apos;ve successfully signed up. Please check your email to confirm your account before signing in.
                </p>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    <strong>Next steps:</strong>
                  </p>
                  <ol className="mt-2 text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the confirmation link in the email</li>
                    <li>You&apos;ll be redirected back to the app automatically</li>
                  </ol>
                </div>
                <div className="text-center">
                  <Link href="/auth/login" className="text-sm text-primary hover:underline">
                    Already confirmed? Sign in here
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
