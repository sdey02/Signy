"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Shield, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// This should be dynamic as it handles auth state
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message)
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#121212] text-white relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242, 196, 196, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(242, 196, 196, 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center content */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center relative z-10">
        {/* Logo and Heading */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-gradient-to-b from-[#f2c4c4] to-[#edb5b5] flex items-center justify-center shadow-[0_0_15px_rgba(242,196,196,0.5)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="7" height="7" rx="1" fill="black" />
                <rect x="13" y="4" width="7" height="7" rx="1" fill="black" />
                <rect x="4" y="13" width="7" height="7" rx="1" fill="black" />
                <rect x="13" y="13" width="7" height="7" rx="1" fill="black" opacity="0.5" />
              </svg>
            </div>
            <span className="font-semibold text-2xl">Signy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back</h1>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <CheckCircle className="w-4 h-4" />
            <span>Sign in to your account</span>
          </div>
        </div>

        {/* Form Container */}
        <div
          className="w-full max-w-md mx-auto bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl p-6 md:p-8 
                      shadow-[0_10px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]
                      border border-[#333] relative overflow-hidden"
        >
          {/* Subtle highlight at the top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-medium text-white">Login with:</h2>
              <div className="flex gap-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-[#1a1a1a]/80 border-[#333] hover:bg-[#2a2a2a] text-white
                            shadow-[0_2px_5px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]
                            transition-all duration-200 hover:shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-[#1a1a1a]/80 border-[#333] hover:bg-[#2a2a2a] text-white
                            shadow-[0_2px_5px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]
                            transition-all duration-200 hover:shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  Github
                </Button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#333]"></div>
              </div>
              <div className="relative px-4 text-sm bg-[#1a1a1a] text-gray-300">Or</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-gray-300">
                Email
              </label>
              <div className={`relative ${focusedField === "email" ? "z-10" : ""}`}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-[#1a1a1a]/90 border-[#333] text-white pl-9
                            shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]
                            focus:shadow-[0_0_0_2px_rgba(237,181,181,0.5),0_0_0_4px_rgba(237,181,181,0.25),inset_0_1px_3px_rgba(0,0,0,0.2)]
                            transition-all duration-200
                            ${focusedField === "email" ? "border-[#edb5b5] ring-0 outline-none" : ""}`}
                  onFocus={() => handleFocus("email")}
                  onBlur={handleBlur}
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm text-gray-300">
                  Password
                </label>
                <Link href="#" className="text-xs text-[#edb5b5] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className={`relative ${focusedField === "password" ? "z-10" : ""}`}>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-[#1a1a1a]/90 border-[#333] text-white pl-9 pr-9
                            shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]
                            focus:shadow-[0_0_0_2px_rgba(237,181,181,0.5),0_0_0_4px_rgba(237,181,181,0.25),inset_0_1px_3px_rgba(0,0,0,0.2)]
                            transition-all duration-200
                            ${focusedField === "password" ? "border-[#edb5b5] ring-0 outline-none" : ""}`}
                  onFocus={() => handleFocus("password")}
                  onBlur={handleBlur}
                />
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-950/50 border border-red-900/50 p-4">
                <div className="text-sm text-red-500">{error}</div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="h-4 w-4 rounded border-[#333] bg-[#1a1a1a] text-[#edb5b5] focus:ring-[#edb5b5]" 
              />
              <label htmlFor="remember" className="text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-b from-[#f2c4c4] to-[#edb5b5] text-black font-medium
                        shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]
                        hover:shadow-[0_6px_15px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]
                        active:shadow-[0_2px_5px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]
                        active:translate-y-0.5
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>

            <div className="text-center text-sm">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#edb5b5] hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-400 mb-4">
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Help
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Globe className="w-4 h-4" />
            <span>English</span>
          </div>
        </div>
      </div>
    </div>
  )
} 