import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX, BookOpen, KeyRound } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

type AuthMethod = "email" | "password";

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password auth state
  const [passwordFlow, setPasswordFlow] = useState<"signIn" | "signUp">("signIn");
  const [passwordUsername, setPasswordUsername] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  // Reset error when switching methods
  useEffect(() => {
    setError(null);
  }, [method, passwordFlow, step]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUsername.trim() || !passwordValue) return;

    if (passwordFlow === "signUp" && passwordValue !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (passwordFlow === "signUp" && passwordValue.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", passwordUsername.trim());
      formData.set("password", passwordValue);
      formData.set("flow", passwordFlow);
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
        <div className="max-w-6xl mx-auto px-6 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-serif">Study Notebook</span>
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
              {method === "email" ? "Welcome back" : "Study Notebook"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 handwriting">
              {method === "email"
                ? "Sign in to your study notebook"
                : passwordFlow === "signIn"
                  ? "Sign in with your username"
                  : "Create your study account"}
            </p>
          </div>

          <Card className="border-border/70 shadow-sm bg-card/95">
            {/* Method Tabs */}
            <div className="flex border-b border-border/60">
              <button
                onClick={() => { setMethod("email"); setStep("signIn"); }}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  method === "email"
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                Email
              </button>
              <button
                onClick={() => { setMethod("password"); setPasswordFlow("signIn"); }}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  method === "password"
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 inline mr-1.5" />
                Password
              </button>
            </div>

            {/* Email OTP Flow */}
            {method === "email" && (
              <>
                {step === "signIn" ? (
                  <>
                    <CardHeader className="text-center pb-2 pt-4">
                      <CardTitle className="text-base font-serif">Email Sign In</CardTitle>
                      <CardDescription>
                        Enter your email to log in or sign up
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleEmailSubmit}>
                      <CardContent>
                        <div className="relative flex items-center gap-2">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              name="email"
                              placeholder="name@example.com"
                              type="email"
                              className="pl-9 bg-background"
                              disabled={isLoading}
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="outline"
                            size="icon"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {error && (
                          <p className="mt-2 text-sm text-destructive">{error}</p>
                        )}

                        <div className="mt-4">
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
                            className="w-full mt-4 border-2"
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Continue as Guest
                          </Button>
                        </div>
                      </CardContent>
                    </form>
                  </>
                ) : (
                  <>
                    <CardHeader className="text-center mt-4">
                      <CardTitle className="font-serif">Check your email</CardTitle>
                      <CardDescription>
                        We've sent a code to {step.email}
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleOtpSubmit}>
                      <CardContent className="pb-4">
                        <input type="hidden" name="email" value={step.email} />
                        <input type="hidden" name="code" value={otp} />

                        <div className="flex justify-center">
                          <InputOTP
                            value={otp}
                            onChange={setOtp}
                            maxLength={6}
                            disabled={isLoading}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                                const form = (e.target as HTMLElement).closest("form");
                                if (form) form.requestSubmit();
                              }
                            }}
                          >
                            <InputOTPGroup>
                              {Array.from({ length: 6 }).map((_, index) => (
                                <InputOTPSlot key={index} index={index} />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        {error && (
                          <p className="mt-2 text-sm text-destructive text-center">
                            {error}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          Didn't receive a code?{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto text-accent"
                            onClick={() => { setStep("signIn"); setError(null); }}
                          >
                            Try again
                          </Button>
                        </p>
                      </CardContent>
                      <div className="px-6 pb-4 flex flex-col gap-2">
                        <Button
                          type="submit"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={isLoading || otp.length !== 6}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify code
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setStep("signIn"); setError(null); }}
                          disabled={isLoading}
                          className="w-full"
                        >
                          Use different email
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}

            {/* Password Flow */}
            {method === "password" && (
              <>
                <CardHeader className="text-center pb-2 pt-4">
                  <CardTitle className="text-base font-serif">
                    {passwordFlow === "signIn" ? "Sign In" : "Create Account"}
                  </CardTitle>
                  <CardDescription>
                    {passwordFlow === "signIn"
                      ? "Enter your username and password"
                      : "Choose a username and password"}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1 font-medium">
                        Username
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={passwordUsername}
                          onChange={(e) => setPasswordUsername(e.target.value)}
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
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        type="password"
                        placeholder={passwordFlow === "signUp" ? "At least 8 characters" : "Enter your password"}
                        className="bg-background"
                        disabled={isLoading}
                        required
                        autoComplete={passwordFlow === "signUp" ? "new-password" : "current-password"}
                      />
                    </div>
                    {passwordFlow === "signUp" && (
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
                        !passwordUsername.trim() ||
                        !passwordValue ||
                        (passwordFlow === "signUp" && !confirmPassword)
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {passwordFlow === "signIn" ? "Signing in..." : "Creating account..."}
                        </>
                      ) : (
                        <>
                          {passwordFlow === "signIn" ? "Sign In" : "Create Account"}
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
                          {passwordFlow === "signIn" ? "New here?" : "Have an account?"}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setPasswordFlow(passwordFlow === "signIn" ? "signUp" : "signIn");
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      {passwordFlow === "signIn" ? "Create a new account" : "Sign in instead"}
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
              </>
            )}

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
