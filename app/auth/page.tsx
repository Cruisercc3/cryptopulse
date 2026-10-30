"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, Eye, EyeOff, ArrowLeft, Github, Chrome, Lock, Mail, User, CheckCircle2, Shield, Activity, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthMode = "signin" | "signup"

const features = [
  { icon: Activity, label: "Live Signal Feed", desc: "Real-time bullish, bearish, contrarian & neutral signals" },
  { icon: BarChart3, label: "Technical Indicators", desc: "Per-asset RSI, MACD, and Fear & Greed overlays" },
  { icon: Shield, label: "Watchlists", desc: "Save and monitor your preferred prediction markets" },
  { icon: Lock, label: "Alert Thresholds", desc: "Custom notifications when signals cross your defined levels" },
]

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  // Accounts aren't built. The buttons say so instead of pretending to sign in.
  const handleOAuth = (provider: "github" | "google") => {
    setFormError(`${provider === "github" ? "GitHub" : "Google"} sign-in isn't built yet. The live pages work without an account.`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (mode === "signup") {
      if (!name.trim()) return setFormError("Full name is required.")
      if (password !== confirmPassword) return setFormError("Passwords do not match.")
      if (password.length < 8) return setFormError("Password must be at least 8 characters.")
    }

    if (!email.includes("@")) return setFormError("Please enter a valid email address.")
    if (!password) return setFormError("Password is required.")

    // Nothing is sent anywhere. There is no account backend yet.
    setFormSuccess(true)
  }

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: "", color: "bg-border/30", width: "w-0" }
    if (pw.length < 6) return { label: "Weak", color: "bg-red-500", width: "w-1/4" }
    if (pw.length < 10) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" }
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { label: "Strong", color: "bg-emerald-500", width: "w-full" }
    return { label: "Good", color: "bg-primary", width: "w-3/4" }
  }

  const strength = passwordStrength(password)

  if (formSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2 font-heading">
            Accounts aren&apos;t built yet
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Nothing was sent or stored. Signals, Predictions, Trending and Charts all work
            without an account, and saved signals stay in your browser.
          </p>
          <Link href="/signals">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full h-9 text-sm shadow-lg shadow-primary/20">
              Go to Signals
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 p-10 bg-card/30 border-r border-border/30 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group mb-auto relative z-10">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">TheCryptoPulse</p>
            <p className="text-[10px] text-primary font-medium tracking-wider uppercase">AI Signals</p>
          </div>
        </Link>

        {/* Headline */}
        <div className="relative z-10 my-12">
          <h2 className="text-3xl font-bold text-foreground leading-tight mb-4 font-heading text-balance">
            Prediction market intelligence, personalized.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your account to unlock a personalized signal feed, watchlists, and 
            custom alert thresholds tied to the assets you track.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4 mb-auto">
          {features.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <f.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="relative z-10 mt-10 text-[11px] text-muted-foreground/50">
          TheCryptoPulse does not provide financial advice. All signals are informational only.
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-xl bg-secondary/40 border border-border/30 mb-8">
            {(["signin", "signup"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setFormError(null) }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground font-heading">
              {mode === "signin" ? "Welcome back" : "Join TheCryptoPulse"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin"
                ? "Sign in to access your signal feed and watchlists."
                : "Create an account to start tracking prediction market signals."}
            </p>
          </div>

          {/* Plain notice: there is no account backend */}
          <div className="mb-6 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-400">Preview only.</span> Accounts aren&apos;t built yet, so this form
            doesn&apos;t sign you in and nothing you type is sent anywhere.
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2.5 mb-6">
            <Button
              variant="outline"
              className="w-full h-10 text-sm border-border/50 hover:border-border hover:bg-secondary/30 transition-all duration-200 font-medium"
              onClick={() => handleOAuth("github")}
              disabled={loading !== null}
            >
              {loading === "github" ? (
                <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mr-2" />
              ) : (
                <Github className="w-4 h-4 mr-2" />
              )}
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 text-sm border-border/50 hover:border-border hover:bg-secondary/30 transition-all duration-200 font-medium"
              onClick={() => handleOAuth("google")}
              disabled={loading !== null}
            >
              {loading === "google" ? (
                <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mr-2" />
              ) : (
                <Chrome className="w-4 h-4 mr-2" />
              )}
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[11px] text-muted-foreground/60">or continue with email</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-10 text-sm bg-secondary/30 border-border/40 focus:border-primary/50 transition-colors"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-sm bg-secondary/30 border-border/40 focus:border-primary/50 transition-colors"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                {mode === "signin" && (
                  <button type="button" className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-10 text-sm bg-secondary/30 border-border/40 focus:border-primary/50 transition-colors"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {mode === "signup" && password && (
                <div className="space-y-1">
                  <div className="h-1 w-full rounded-full bg-border/30 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  {strength.label && (
                    <p className={`text-[10px] font-medium ${
                      strength.label === "Weak" ? "text-red-500" :
                      strength.label === "Fair" ? "text-amber-500" :
                      strength.label === "Good" ? "text-primary" : "text-emerald-500"
                    }`}>{strength.label}</p>
                  )}
                </div>
              )}
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-9 pr-10 h-10 text-sm bg-secondary/30 border-border/40 focus:border-primary/50 transition-colors ${
                      confirmPassword && confirmPassword !== password ? "border-red-500/50" : ""
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[10px] text-red-500">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Error */}
            {formError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                {formError}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 mt-2"
              disabled={loading !== null}
            >
              {loading === "email" ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </Button>

            {mode === "signup" && (
              <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed">
                By creating an account you agree to our{" "}
                <span className="text-primary/70 hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
                {" "}and{" "}
                <span className="text-primary/70 hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
