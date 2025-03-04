import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Users, Zap, Headphones, DatabaseZap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// This can be static as it's just a marketing page with no dynamic content
export const dynamic = 'force-static'

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242, 196, 196, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(242, 196, 196, 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 px-8 relative z-10">
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
            About
          </Link>
          <Link href="/features" className="text-gray-400 hover:text-white text-sm font-light">
            Features
          </Link>
          <Link href="/enterprise" className="text-white text-sm font-light">
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

      {/* Header section */}
      <div className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 relative z-10">
        <Badge 
          variant="secondary" 
          className="mb-8 bg-[#1a1a1a] text-white border border-[#333] rounded-sm py-1.5 px-8 text-sm font-light tracking-wide"
        >
          Enterprise Solutions
        </Badge>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium max-w-4xl tracking-tight">
          <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent inline-block leading-[1.2] pb-1">
            Power your business with
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent inline-block leading-[1.2] pb-2">
            enterprise-grade agreements.
          </span>
        </h2>

        <p className="text-gray-400 max-w-2xl mt-8 text-base font-light leading-relaxed tracking-wide">
          Signy Enterprise offers customizable solutions for organizations with complex agreement workflows, 
          enhanced security, and dedicated support to meet the needs of large businesses.
        </p>
      </div>

      {/* Enterprise features */}
      <div className="container mx-auto px-4 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#1e1e1e] rounded-lg p-8 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all">
            <Building2 className="h-10 w-10 text-[#edb5b5] mb-4" />
            <h3 className="text-xl font-medium mb-2">Custom Deployment</h3>
            <p className="text-gray-400 text-sm">
              Private cloud or on-premises deployment options with dedicated infrastructure tailored to your organization's requirements.
            </p>
          </div>

          <div className="bg-[#1e1e1e] rounded-lg p-8 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all">
            <ShieldCheck className="h-10 w-10 text-[#edb5b5] mb-4" />
            <h3 className="text-xl font-medium mb-2">Advanced Security</h3>
            <p className="text-gray-400 text-sm">
              Enhanced security features including SSO integration, role-based access controls, and audit logs for compliance requirements.
            </p>
          </div>

          <div className="bg-[#1e1e1e] rounded-lg p-8 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all">
            <Users className="h-10 w-10 text-[#edb5b5] mb-4" />
            <h3 className="text-xl font-medium mb-2">Unlimited Users</h3>
            <p className="text-gray-400 text-sm">
              Support for unlimited users with custom user roles and permissions to match your organizational structure.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4 py-16 text-center relative z-10 mb-10">
        <h3 className="text-2xl font-medium mb-6 text-white">Transform your agreement workflows today</h3>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Join leading enterprises who trust Signy to power their most important agreements and document workflows.
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-b from-[#f2c4c4] to-[#edb5b5] text-black hover:from-[#f5d0d0] hover:to-[#f0bebe] font-normal text-sm tracking-wide"
        >
          Schedule a consultation
        </Button>
      </div>
    </div>
  );
} 