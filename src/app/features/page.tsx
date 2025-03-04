import Link from "next/link";
import { ArrowRight, FileSignature, FileText, Clock, Users, Shield, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
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
            Home
          </Link>
          <Link href="/features" className="text-white text-sm font-light">
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

      {/* Header section */}
      <div className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 relative z-10">
        <Badge 
          variant="secondary" 
          className="mb-8 bg-[#1a1a1a] text-white border border-[#333] rounded-sm py-1.5 px-8 text-sm font-light tracking-wide"
        >
          Powerful Features
        </Badge>

        <h2 className="text-4xl md:text-5xl font-medium max-w-4xl tracking-tight">
          <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent inline-block leading-[1.2] pb-1">
            Everything you need for
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent inline-block leading-[1.2] pb-2">
            modern agreement workflows.
          </span>
        </h2>

        <p className="text-gray-400 max-w-2xl mt-8 text-base font-light leading-relaxed tracking-wide">
          Signy brings together all the tools you need to create, manage, and sign contracts efficiently in one intuitive platform.
        </p>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {/* Feature Card 1 - Templates */}
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all">
          <div className="mb-4">
            <FileText className="h-6 w-6 text-white opacity-80" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-white">Smart Templates</h3>
          <p className="text-gray-400 text-sm mb-6">
            Create and customize agreement templates with dynamic fields and clauses.
          </p>
          <div className="bg-[#161616] rounded p-4 font-mono text-xs text-gray-300 overflow-x-auto">
            <pre className="flex items-center">
              <span className="text-white">
{`// Template Definition
template("Service Agreement") {
  dynamicField("clientName")
  dynamicField("startDate")
  conditionalClause("paymentTerms", [
    "net30",
    "net60",
    "custom"
  ])
}`}
              </span>
            </pre>
          </div>
        </div>

        {/* Feature Card 2 - Document Tracking */}
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all">
          <div className="mb-4">
            <Clock className="h-6 w-6 text-white opacity-80" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-white">Document Tracking</h3>
          <p className="text-gray-400 text-sm mb-6">
            Real-time status updates and comprehensive audit trails for all your agreements.
          </p>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-white">Document sent</div>
                <div className="text-xs text-gray-400">Nov 12, 2023 at 10:30 AM</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs text-white">Viewed by recipient</div>
              <div className="text-xs text-gray-400 ml-2">Nov 12, 2023 at 11:45 AM</div>
            </div>
            
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-white">Signed by John Doe</div>
                <div className="text-xs text-gray-400">Nov 12, 2023 at 2:15 PM</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-amber-500 mr-2 flex items-center justify-center">
                <div className="h-2 w-2 bg-[#161616] rounded-full"></div>
              </div>
              <div className="text-xs text-white">Waiting for signature <span className="text-gray-400">from Jane Smith</span></div>
            </div>
            
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-gray-700 mr-2 flex items-center justify-center opacity-70">
                <div className="h-2 w-2 bg-[#161616] rounded-full"></div>
              </div>
              <div className="text-xs text-gray-400">Completion certificate generation pending</div>
            </div>
          </div>
        </div>

        {/* Feature Card 3 - Security & Compliance */}
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all">
          <div className="mb-4">
            <Shield className="h-6 w-6 text-white opacity-80" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-white">Security & Compliance</h3>
          <p className="text-gray-400 text-sm mb-6">
            Bank-level security and compliance with global e-signature regulations.
          </p>
          <div className="bg-[#161616] rounded p-4 font-mono text-xs text-gray-300 overflow-x-auto">
            <pre className="mb-2">
{`// Security Features
const security = {
  encryption: "AES-256",
  dataStorage: "GDPR Compliant",
  compliance: [
    "eIDAS (EU)",
    "ESIGN Act (US)",
    "UETA (US)"
  ],
  audit: "Tamper-proof"
}`}
            </pre>
            <div className="flex items-center rounded bg-[#1a2a1a] border border-[#2a4a2a] p-3 mt-2">
              <div className="text-green-400 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div>
                <p className="text-white text-xs font-medium">Advanced Encryption</p>
                <p className="text-gray-400 text-xs">Your documents are protected with end-to-end encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center relative z-10">
        <h3 className="text-3xl font-medium mb-6 text-white">Ready to get started?</h3>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Join thousands of businesses that use Signy to create, manage, and sign agreements quickly and securely.
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-b from-[#f2c4c4] to-[#edb5b5] text-black hover:from-[#f5d0d0] hover:to-[#f0bebe] font-normal text-sm tracking-wide"
          asChild
        >
          <Link href="/signup">
            Sign up for free
          </Link>
        </Button>
      </div>
    </div>
  );
} 