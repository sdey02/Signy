import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] text-white overflow-hidden relative">
      {/* Main content */}
      <div>
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
            <Link href="#" className="text-gray-400 hover:text-white text-sm font-light">
              About
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm font-light">
              Features
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm font-light">
              Enterprise
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white text-sm font-light">
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

        {/* Hero section */}
        <div className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-24">
          <Badge 
            variant="secondary" 
            className="mb-8 bg-[#1a1a1a] text-white border border-[#333] rounded-sm py-1.5 px-8 text-sm font-light tracking-wide"
          >
            Smarter contracts, powered by AI
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium max-w-4xl tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent inline-block leading-[1.2] pb-1">
              An All-In-One
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent inline-block leading-[1.2] pb-2">
              Agreements Platform.
            </span>
          </h2>

          <p className="text-gray-400 max-w-2xl mt-8 text-base font-light leading-relaxed tracking-wide">
            The best solution for creating and managing contracts, streamlining negotiations, enhancing compliance,
            optimizing workflows, and converting more customers — all within one intuitive platform.
          </p>

          <Button
            size="lg"
            className="mt-12 bg-gradient-to-b from-[#f2c4c4] to-[#edb5b5] text-black hover:from-[#f5d0d0] hover:to-[#f0bebe] font-normal text-sm tracking-wide"
            asChild
          >
            <Link href="/signup">
              Get Started for free
            </Link>
          </Button>

          <p className="text-gray-400 mt-6 text-sm font-light tracking-wide">
            Start sending and signing agreements today, for free.
          </p>
        </div>
      </div>
    </div>
  )
}

