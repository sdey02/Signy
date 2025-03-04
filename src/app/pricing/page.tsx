"use client"

import { useState } from "react"
import { Check, User, Building, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// This can be static as it shows fixed pricing information
export const dynamic = 'force-static'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "enterprise">("basic")

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

      {/* Main content */}
      <div className="relative z-10 w-full">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6 px-8">
          <div className="flex items-center">
            <div className="mr-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="7" height="7" rx="1" fill="white" />
                <rect x="13" y="4" width="7" height="7" rx="1" fill="white" />
                <rect x="4" y="13" width="7" height="7" rx="1" fill="white" />
                <rect x="13" y="13" width="7" height="7" rx="1" fill="white" opacity="0.5" />
              </svg>
            </div>
            <h1 className="text-lg font-medium tracking-wide">Signy</h1>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-400 hover:text-white text-sm font-light">
              Home
            </Link>
            <Link href="/features" className="text-gray-400 hover:text-white text-sm font-light">
              Features
            </Link>
            <Link href="/enterprise" className="text-gray-400 hover:text-white text-sm font-light">
              Enterprise
            </Link>
            <Link href="/pricing" className="text-white text-sm font-light">
              Pricing
            </Link>
          </div>

          <div>
            <Button variant="outline" asChild className="font-light">
              <Link href="/login">
                Login <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-[#edb5b5]">PRICING</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-center mb-4">
              <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent inline-block leading-[1.2] pb-1">
                Simple, transparent pricing
              </span>
            </h1>
            <p className="text-gray-400 text-base font-light leading-relaxed tracking-wide text-center mb-8 max-w-2xl mx-auto">
              No matter the size of your team, our pricing is designed to scale with your needs.
              Choose the plan that works best for you.
            </p>
          </div>

          {/* Pricing cards */}
          <RadioGroup
            value={selectedPlan}
            onValueChange={(value) => setSelectedPlan(value as "basic" | "enterprise")}
            className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2"
          >
            {/* Basic Plan */}
            <div className="relative">
              <RadioGroupItem value="basic" id="basic" className="sr-only" />
              <Label htmlFor="basic">
                <Card
                  className={cn(
                    "cursor-pointer bg-[#1a1a1a]/80 backdrop-blur-md border-[#333] text-white transition-all duration-300 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                    selectedPlan === "basic" ? "ring-2 ring-[#edb5b5] ring-offset-2 ring-offset-[#121212]" : "",
                  )}
                >
                  {/* Subtle highlight at the top */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent"></div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">Basic</h3>
                        <p className="text-sm text-gray-400">For startups and growing companies</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[#2a2a2a] p-2 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-4xl font-bold">
                        $0 <span className="text-lg font-normal text-gray-400">per month</span>
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#edb5b5]" />
                        <span>Basic document templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#edb5b5]" />
                        <span>Up to 5 agreements per month</span>
                      </li>
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button
                      className={cn(
                        "w-full rounded-full",
                        selectedPlan === "basic"
                          ? "bg-gradient-to-b from-[#f2c4c4] to-[#edb5b5] text-black hover:from-[#f5d0d0] hover:to-[#f0bebe] font-medium shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]"
                          : "bg-[#2a2a2a] text-white hover:bg-[#333333]",
                      )}
                      asChild
                    >
                      <Link href="/signup">
                        Get Started
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </Label>
            </div>

            {/* Enterprise Plan */}
            <div className="relative">
              <RadioGroupItem value="enterprise" id="enterprise" className="sr-only" />
              <Label htmlFor="enterprise">
                <Card
                  className={cn(
                    "cursor-pointer bg-[#1a1a1a]/80 backdrop-blur-md border-[#333] text-white transition-all duration-300 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                    selectedPlan === "enterprise" ? "ring-2 ring-[#edb5b5] ring-offset-2 ring-offset-[#121212]" : "",
                  )}
                >
                  {/* Subtle highlight at the top */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent"></div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">Enterprise</h3>
                        <p className="text-sm text-gray-400">For global enterprises with custom needs</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[#2a2a2a] p-2 flex items-center justify-center">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-4xl font-bold">
                        $5 <span className="text-lg font-normal text-gray-400">per month</span>
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#edb5b5]" />
                        <span>Custom document templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#edb5b5]" />
                        <span>Unlimited agreements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#edb5b5]" />
                        <span>Priority 24/7 support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#edb5b5]" />
                        <span>Priority feature requests</span>
                      </li>
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button
                      className={cn(
                        "w-full rounded-full",
                        selectedPlan === "enterprise"
                          ? "bg-gradient-to-b from-[#f2c4c4] to-[#edb5b5] text-black hover:from-[#f5d0d0] hover:to-[#f0bebe] font-medium shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]"
                          : "bg-[#2a2a2a] text-white hover:bg-[#333333]",
                      )}
                      asChild
                    >
                      <Link href="/signup">
                        Get Started
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </Label>
            </div>
          </RadioGroup>

          {/* Additional info */}
          <div className="mt-16 text-center">
            <h2 className="mb-6 text-2xl font-bold">Have Questions?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              Our team is here to help you find the perfect plan for your business. 
              Get in touch with us for a personalized consultation.
            </p>
            <Link href="#" className="text-[#edb5b5] hover:underline">
              Contact our sales team →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 