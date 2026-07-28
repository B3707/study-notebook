import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight, Loader2, UserX, BookOpen, KeyRound, Moon, Sun } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  useEffect(() => {
    setError(null);
  }, [flow]);

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    if (flow === "signUp" && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (flow === "signUp" && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", username.trim());
      formData.set("password", password);
      formData.set("flow", flow);
      await signIn("password", formData);
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    } catch (error) {
      console.error("Password auth error:", error);
      const message = error instanceof Error ? error.message : "Authentication failed. Please try again.";
      if (message.includes("already exists")) {
        setError("This username is already taken. Try signing in instead.");
      } else if (message.includes("Invalid")) {
        setError("Invalid username or password.");
      } else {
        setError(message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-serif">Clockocus</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Clockocus
            </h1>
            <p className="text-sm text-muted-foreground mt-1 handwriting">
              {flow === "signIn"
                ? "Sign in with your username"
                : "Create your study account"}
            </p>
          </div>

          <Card className="border-border/70 shadow-sm bg-card/95">
            <CardHeader className="text-center pb-2 pt-4">
              <CardTitle className="text-base font-serif">
                {flow === "signIn" ? "Sign In" : "Create Account"}
              </CardTitle>
              <CardDescription>
                {flow === "signIn"
                  ? "Enter your username and password"
                  : "Choose a username and password"}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your-username"
                      className="pl-9 bg-background"
                      disabled={isLoading}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">
                    Password
                  </label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder={flow === "signUp" ? "At least 8 characters" : "Enter your password"}
                    className="bg-background"
                    disabled={isLoading}
                    required
                    autoComplete={flow === "signUp" ? "new-password" : "current-password"}
                  />
                </div>

                {flow === "signUp" && (
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1 font-medium">
                      Confirm Password
                    </label>
                    <Input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type="password"
                      placeholder="Re-enter your password"
                      className="bg-background"
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={
                    isLoading ||
                    !username.trim() ||
                    !password ||
                    (flow === "signUp" && !confirmPassword)
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {flow === "signIn" ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {flow === "signIn" ? "Sign In" : "Create Account"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <hr className="notebook-divider w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {flow === "signIn" ? "New here?" : "Have an account?"}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setFlow(flow === "signIn" ? "signUp" : "signIn");
                    setError(null);
                  }}
                  disabled={isLoading}
                >
                  {flow === "signIn" ? "Create a new account" : "Sign in instead"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <hr className="notebook-divider w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Continue as Guest
                </Button>
              </CardContent>
            </form>

            <div className="py-3 px-6 text-xs text-center text-muted-foreground bg-secondary/50 border-t border-border/60 rounded-b-lg">
              <span className="handwriting">
                Secured by{" "}
                <a
                  href="https://freebuff.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  freebuff.com
                </a>
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
