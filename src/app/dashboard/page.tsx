"use client"

import * as React from "react"
import { BarChart, FileText, Grid, Home, Share2, Pencil, Trash2, Search, Settings, ShieldCheck, X, Upload, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toaster } from "@/components/ui/toaster"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { createBrowserClient } from "@/lib/supabase"
import { Database } from "@/lib/database.types"
import { FileUpload } from "@/components/FileUpload"

type Document = Database['public']['Tables']['documents']['Row'];

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const supabase = createBrowserClient()

  React.useEffect(() => {
    async function loadDocuments() {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          
        if (error) {
          console.error('Error loading documents:', error)
          return
        }
        
        setDocuments(data as Document[] || [])
      } catch (err) {
        console.error('Failed to load documents:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDocuments()
  }, [user])

  const handleUploadComplete = async (fileUrl: string) => {
    if (user) {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      setDocuments(data as Document[] || [])
      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    }
  }

  const handleUploadError = (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  }

  const handleDelete = async (doc: Document) => {
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: doc.b2_file_id,
          fileName: doc.file_name,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete file');
      }

      // Remove the deleted document from the state
      setDocuments(documents.filter(d => d.id !== doc.id));

      toast({
        title: `"${doc.file_name}" deleted`,
        description: "File has been permanently deleted.",
        action: (
          <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-[#333]" onClick={() => {}}>
            Dismiss
          </Button>
        )
      });
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // Get user's display name or fall back to email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-[#121212] text-white overflow-hidden relative">
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
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md md:flex flex-col">
          {/* User Profile */}
          <div className="p-2">
            <div className="flex items-center gap-3 p-3 bg-[#1E1E1E] rounded-lg hover:bg-[#252525] transition-colors">
              <Avatar className="h-10 w-10 rounded-lg border border-[#333]">
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url || "/placeholder.svg"} 
                  alt={displayName}
                  className="rounded-lg"
                />
                <AvatarFallback className="rounded-lg">{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{displayName}</div>
                <div className="text-sm text-[#888] truncate">{user?.email}</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto text-[#888] hover:text-white">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-2">
            <div className="space-y-1">
              <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333] w-full">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333] w-full">
                <FileText className="h-4 w-4" />
                <span>Templates</span>
              </Button>
              <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333] w-full">
                <BarChart className="h-4 w-4" />
                <span>Analysis</span>
              </Button>
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-[#333]">
            <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333] w-full">
              <ShieldCheck className="h-4 w-4" />
              <span>Support</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333] w-full">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Documents</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search documents..." 
                    className="w-full rounded-lg pl-8 md:w-[300px] bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
                  Filters
                </Button>
              </div>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                variant="outline"
                className="border-[#333] text-white hover:bg-[#333]"
              />
            </div>

            {/* Table section */}
            <div className="rounded-lg border border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#333] hover:bg-[#333]/50">
                    <TableHead className="w-12">
                      <Checkbox className="border-[#333]" />
                    </TableHead>
                    <TableHead>File name</TableHead>
                    <TableHead>Sent to</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last modified</TableHead>
                    <TableHead className="w-[136px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-[#edb5b5] rounded-full border-t-transparent animate-spin"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="border-[#333] hover:bg-[#333]/50">
                        <TableCell>
                          <Checkbox className="border-[#333]" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#edb5b5]" />
                            <div className="font-medium">{doc.file_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-400">-</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#1a1a1a] text-[#edb5b5] border-[#edb5b5]">
                            Uploaded
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-400">{format(new Date(doc.created_at), "MMM d, yyyy")}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 transition-colors hover:text-blue-400 hover:bg-[rgba(96,165,250,0.1)]"
                            >
                              <Share2 className="h-4 w-4" />
                              <span className="sr-only">Share file</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 transition-colors hover:text-green-400 hover:bg-[rgba(34,197,94,0.1)]"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit file</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-400 transition-colors hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)]"
                              onClick={() => handleDelete(doc)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete file</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
} 