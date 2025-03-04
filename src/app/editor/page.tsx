"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get document information from URL parameters
  const fileUrl = searchParams.get("fileUrl")
  const fileName = searchParams.get("fileName")
  const documentId = searchParams.get("documentId")
  
  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }
  
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#333] bg-[#1a1a1a] p-4">
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
              <Button className="bg-[#edb5b5] text-black hover:bg-[#e9a0a0]">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-[#1a1a1a] border border-[#333] rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">PDF Editor</h2>
          <p className="text-gray-400 mb-6">
            This is a placeholder for the PDF editor functionality. 
            The actual PDF editor will be implemented here.
          </p>
          
          {fileUrl && (
            <div className="mb-6 p-4 bg-[#222] rounded-lg overflow-hidden">
              <p className="text-sm text-gray-400 mb-2">Document Information:</p>
              <p className="text-sm truncate"><strong>File Name:</strong> {fileName}</p>
              <p className="text-sm truncate"><strong>Document ID:</strong> {documentId}</p>
              <p className="text-sm truncate"><strong>File URL:</strong> {fileUrl}</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-[#333] hover:bg-[#333]">
              Add Text
            </Button>
            <Button variant="outline" className="border-[#333] hover:bg-[#333]">
              Add Signature
            </Button>
            <Button variant="outline" className="border-[#333] hover:bg-[#333]">
              Draw
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 