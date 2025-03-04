"use client"

import { useState, useEffect } from "react"
import { Viewer, SpecialZoomLevel, Worker, LoadError } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { fullScreenPlugin } from '@react-pdf-viewer/full-screen'
import { zoomPlugin } from '@react-pdf-viewer/zoom'
import { getPdfWorkerSrc } from '@/lib/pdfjs-config'

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import '@react-pdf-viewer/full-screen/lib/styles/index.css'
import '@react-pdf-viewer/zoom/lib/styles/index.css'

interface PdfViewerProps {
  fileUrl: string
  onDocumentLoad?: () => void
  height?: string
  className?: string
}

export function PdfViewer({ 
  fileUrl, 
  onDocumentLoad, 
  height = 'calc(100vh - 250px)',
  className = '',
}: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [workerUrl, setWorkerUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Create plugins
  const defaultLayoutPluginInstance = defaultLayoutPlugin()
  const fullScreenPluginInstance = fullScreenPlugin()
  const zoomPluginInstance = zoomPlugin()

  useEffect(() => {
    // Use the configuration utility
    const { cdnWorkerUrl, localWorkerUrl } = getPdfWorkerSrc()
    
    // Check if the CDN is accessible, otherwise use local file
    fetch(cdnWorkerUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          setWorkerUrl(cdnWorkerUrl)
        } else {
          setWorkerUrl(localWorkerUrl)
        }
        setIsLoading(false)
      })
      .catch(() => {
        // If the fetch fails, use the local worker
        setWorkerUrl(localWorkerUrl)
        setIsLoading(false)
      })
  }, [])

  // Handle errors - now accepts LoadError which is what react-pdf-viewer returns
  const handleError = (error: LoadError) => {
    console.error('Error loading PDF:', error)
    setError(error.message || 'Unknown error loading PDF')
  }

  if (isLoading || !workerUrl) {
    return (
      <div className="text-center p-10">
        <p className="text-gray-400">Loading PDF viewer...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-5 bg-red-100 text-red-700 rounded">
        <p>Failed to load PDF: {error}</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded overflow-hidden ${className}`} style={{ height }}>
      <Worker workerUrl={workerUrl}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[
            defaultLayoutPluginInstance,
            fullScreenPluginInstance,
            zoomPluginInstance,
          ]}
          defaultScale={SpecialZoomLevel.PageFit}
          theme={{
            theme: 'dark',
          }}
          onDocumentLoad={onDocumentLoad}
          renderError={(error) => {
            handleError(error)
            return (
              <div className="text-center p-5 bg-red-100 text-red-700 rounded">
                <p>Failed to load PDF: {error.message || 'Unknown error'}</p>
              </div>
            )
          }}
        />
      </Worker>
    </div>
  )
}

// For dynamic imports
export default PdfViewer; 