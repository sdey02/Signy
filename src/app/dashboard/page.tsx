"use client"

import * as React from "react"
import { BarChart, FileText, Grid, Home, MoreVertical, Search, Settings, ShieldCheck, X, Upload } from "lucide-react"
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

  const filteredDocuments = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

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
      <div className="flex flex-col h-screen">
        {/* Top Navigation */}
        <nav className="border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
          <div className="flex justify-between items-center h-16 px-4 md:px-8">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-400">{user?.email}</span>
            </div>
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover:bg-[#333]"
              onClick={() => signOut()}
            >
              Sign out
            </Button>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden w-64 border-r border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md md:flex flex-col">
            <div className="flex flex-col gap-1 p-2">
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
            <div className="mt-auto flex flex-col gap-1 p-2 border-t border-[#333]">
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
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <FileUpload
                      onUploadComplete={handleUploadComplete}
                      onUploadError={handleUploadError}
                    />
                  </div>
                </div>
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
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-12"></TableHead>
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
                            <Badge variant="outline" className="bg-[#1a1a1a] text-[#edb5b5] border-[#edb5b5]">
                              {doc.file_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-400">{formatFileSize(doc.file_size)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-400">{format(new Date(doc.created_at), "MMM d, yyyy")}</div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">More options</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#333] text-white">
                                <DropdownMenuItem className="hover:bg-[#333]">
                                  <a 
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                  >
                                    View file
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-400 hover:bg-[#333]">Delete file</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </div>
      <Toaster />
    </div>
  )
} 