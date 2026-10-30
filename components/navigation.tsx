"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart3, TrendingUp, Trophy, Zap, Menu, X, Layers, FileText, BookOpen, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/predictions", label: "Predictions", icon: Activity, accent: "cyan" },
  { href: "/signals", label: "Signals", icon: Zap, accent: "emerald" },
  { href: "/charts", label: "Charts", icon: BarChart3, accent: "violet" },
  { href: "/trending", label: "Trending", icon: TrendingUp, accent: "amber" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, accent: "rose" },
]

const secondaryLinks = [
  { href: "/architecture", label: "Architecture", icon: Layers },
  { href: "/acquisition", label: "Acquisition", icon: FileText },
]

const authLinks = [
  { href: "/auth", label: "Sign In / Register", icon: LogIn },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-2"
            : "py-4"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          {/* Main Nav Container - Floating pill design */}
          <div className={`relative flex items-center justify-between rounded-2xl transition-all duration-500 ${
            isScrolled 
              ? "px-4 py-2 glass-card shadow-lg shadow-black/20" 
              : "px-2 py-1"
          }`}>
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center group-hover:border-primary/50 transition-all duration-300">
                  <Zap className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                  TheCryptoPulse
                </span>
                <span className="text-[10px] text-primary font-medium tracking-wider uppercase">
                  AI Signals
                </span>
              </div>
            </Link>

            {/* Center Navigation - Pill tabs */}
            <div className="hidden lg:flex items-center">
              <div className="relative flex items-center gap-0.5 p-1 rounded-xl bg-secondary/40 border border-border/30">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href
                  const isHovered = hoveredIndex === index
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="relative"
                    >
                      <div className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? "text-primary-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}>
                        {/* Active/Hover background */}
                        {(isActive || isHovered) && (
                          <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                            isActive 
                              ? "bg-primary shadow-lg shadow-primary/25" 
                              : "bg-secondary/80"
                          }`} />
                        )}
                        
                        <link.icon className={`relative z-10 w-4 h-4 transition-transform duration-300 ${
                          isHovered && !isActive ? "scale-110" : ""
                        }`} />
                        <span className="relative z-10">{link.label}</span>
                        
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Secondary Links - Desktop */}
              <div className="hidden md:flex items-center gap-1 mr-2">
                {secondaryLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`text-xs h-8 px-3 ${
                        pathname === link.href 
                          ? "text-foreground bg-secondary/50" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-6 bg-border/50" />

              {/* CTA Buttons */}
              <Link href="/docs" className="hidden sm:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-xs h-8 ${
                    pathname === "/docs"
                      ? "text-foreground bg-secondary/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Docs
                </Button>
              </Link>
              
              <Link href="/signals">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-8 px-4 text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 p-0"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
        mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Menu Content */}
        <div className={`absolute top-20 left-4 right-4 glass-card rounded-2xl p-4 transition-all duration-500 ${
          mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}>
          {/* Primary Nav Links */}
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}>
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50 my-4" />

          {/* Secondary Links */}
          <div className="space-y-1">
            {secondaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  pathname === link.href 
                    ? "bg-secondary/80 text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}>
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Auth Links */}
          <div className="h-px bg-border/50 my-2" />
          <div className="space-y-1">
            {authLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}>
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
