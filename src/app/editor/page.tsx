"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Label } from "@/components/pdf/LabelOverlay"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  
  // Get document information from URL parameters
  const fileUrl = searchParams.get("fileUrl")
  const fileName = searchParams.get("fileName")
  const documentId = searchParams.get("documentId")
  
  // State for sidebar visibility and labels
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedLabel, setSelectedLabel] = useState<{
    type: string;
    color: string;
    icon: string;
  } | undefined>()
  const [labels, setLabels] = useState<Label[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing labels when the document is opened
  useEffect(() => {
    const loadLabels = async () => {
      if (!fileUrl) return;

      try {
        // Try to fetch existing labels
        const labelsUrl = `${fileUrl}.labels.json`;
        const response = await fetch(labelsUrl);
        
        if (response.ok) {
          const existingLabels = await response.json();
          setLabels(existingLabels);
        }
      } catch (error) {
        console.log('No existing labels found');
      } finally {
        setIsLoading(false);
      }
    };

    loadLabels();
  }, [fileUrl]);
  
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
    console.log('Label selected from panel:', label);
    if (label && label.type) {
      console.log('Setting selected label to:', label);
      setSelectedLabel(label);
    } else {
      console.log('Clearing selected label');
      setSelectedLabel(undefined);
    }
  }

  // Handle labels change
  const handleLabelsChange = (newLabels: Label[]) => {
    setLabels(newLabels)
  }

  // Handle save
  const handleSave = async () => {
    if (!fileUrl || !documentId) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/b2/save-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          labels,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save labels')
      }

      toast({
        title: "Labels saved successfully",
        description: "Your document labels have been saved.",
      })
    } catch (error) {
      console.error('Error saving labels:', error)
      toast({
        title: "Error saving labels",
        description: "There was a problem saving your document labels. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToDashboard}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-white">
            {fileName || 'Document Editor'}
          </h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#edb5b5] text-black hover:bg-[#e9a0a0]"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </header>

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
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center p-10">
            <p className="text-gray-400">Loading document labels...</p>
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
                  selectedLabel={selectedLabel}
                  onLabelsChange={handleLabelsChange}
                  initialLabels={labels}
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