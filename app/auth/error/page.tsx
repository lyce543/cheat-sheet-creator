import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Error details:</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{params.error}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  There was a problem with email confirmation or authentication.
                </p>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">This might happen if:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>The email confirmation link has expired</li>
                  <li>The link has already been used</li>
                  <li>There was a network issue</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button asChild>
                  <Link href="/auth/login">Try Login Again</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/register">Create New Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
