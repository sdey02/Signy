"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import dynamic from 'next/dynamic'

// Dynamically import components with no SSR
const NextPdfViewer = dynamic(
  () => import('@/components/pdf/NextPdfViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-10 bg-[#1a1a1a] text-white">
        <p className="text-gray-400">Loading PDF viewer...</p>
      </div>
    )
  }
)

const LabelsPanel = dynamic(
  () => import('@/components/pdf/LabelsPanel'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-10 bg-[#1a1a1a] text-white">
        <p className="text-gray-400">Loading labels panel...</p>
      </div>
    )
  }
)

export default function EditorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get document information from URL parameters
  const fileUrl = searchParams.get("fileUrl")
  const fileName = searchParams.get("fileName")
  const documentId = searchParams.get("documentId")
  
  // State for sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }
  
  // Handle document load
  const handleDocumentLoad = () => {
    console.log('PDF document loaded in the editor')
  }
  
  // Handle label selection
  const handleLabelSelect = (label: any) => {
    console.log('Label selected:', label)
    // In a real implementation, this would place the label on the PDF
  }
  
  return (
    <div className="h-screen flex flex-col bg-[#121212] text-white overflow-hidden">
      {/* Header - Fixed height */}
      <header className="border-b border-[#333] bg-[#1a1a1a] p-4 flex-shrink-0">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackToDashboard}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold truncate">{fileName || "Document Editor"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-[#edb5b5] text-black hover:bg-[#e9a0a0] flex items-center gap-1">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </Button>
              <Button 
                variant="outline" 
                className="border-[#333] hover:bg-[#333]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? 'Hide Tools' : 'Show Tools'}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content - Flex 1 to take remaining height */}
      <main className="flex flex-1 overflow-hidden">
        {!fileUrl ? (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center p-10 max-w-md">
              <p className="text-gray-400 mb-6">
                No PDF file selected. Please select a PDF file from your dashboard.
              </p>
              <Button 
                onClick={handleBackToDashboard}
                className="bg-[#edb5b5] text-black hover:bg-[#e9a0a0]"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* PDF Viewer Container - Scrollable content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* PDF Viewer - Scrollable */}
              <div className="flex-1 overflow-auto">
                <NextPdfViewer 
                  fileUrl={fileUrl} 
                  onDocumentLoad={handleDocumentLoad}
                  height="100%"
                  className="h-full"
                />
              </div>
            </div>
            
            {/* Labels Sidebar - Fixed height, non-scrollable container */}
            {sidebarOpen && (
              <div className="w-52 border-l border-[#333] bg-[#1a1a1a] flex-shrink-0 flex flex-col h-full">
                <LabelsPanel onLabelSelect={handleLabelSelect} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
} 