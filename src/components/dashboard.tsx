"use client"

import * as React from "react"
import { BarChart, FileText, Grid, Home, MoreVertical, Search, Settings, ShieldCheck, X } from "lucide-react"
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
import { FolderOpen, LayoutDashboard, PieChart, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Sample data for recently modified files
const recentlyModifiedFiles = [

]

// Sample data for all files
const allFiles = [
  {
    id: 1,
    name: "Dashboard tech requirements",
    size: "220 KB",
    type: "docx",
    uploadedBy: {
      name: "Amelie Laurent",
      email: "amelie@untitledui.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    lastModified: new Date("2024-01-04"),
    status: "Draft",
  },
  {
    id: 2,
    name: "Marketing site requirements",
    size: "488 KB",
    type: "docx",
    uploadedBy: {
      name: "Anmar Foley",
      email: "anmar@untitledui.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    lastModified: new Date("2024-01-05"),
    status: "Sent",
  },
  {
    id: 3,
    name: "Q4_2023 Reporting",
    size: "1.2 MB",
    type: "pdf",
    uploadedBy: {
      name: "Amelie Laurent",
      email: "amelie@untitledui.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    lastModified: new Date("2024-01-05"),
    status: "Signed",
  },
  {
    id: 4,
    name: "Q3_2023 Reporting",
    size: "1.3 MB",
    type: "pdf",
    uploadedBy: {
      name: "Sienna Hewitt",
      email: "sienna@untitledui.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    lastModified: new Date("2024-01-06"),
    status: "Reviewed",
  },
  {
    id: 5,
    name: "Q2_2023 Reporting",
    size: "1.1 MB",
    type: "pdf",
    uploadedBy: {
      name: "Olly Shroeder",
      email: "olly@untitledui.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    lastModified: new Date("2024-01-08"),
    status: "Approved",
  },
  {
    id: 6,
    name: "Q1_2023 Reporting",
    size: "1.3 MB",
    type: "pdf",
    uploadedBy: {
      name: "Mathilde Lewis",
      email: "mathilde@untitledui.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    lastModified: new Date("2024-01-06"),
    status: "Rejected",
  },
  {
    id: 7,
    name: "FY_2022-23 Financials",
    size: "628 KB",
    type: "xls",
    uploadedBy: {
      name: "Sienna Hewitt",
      email: "sienna@untitledui.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    lastModified: new Date("2024-01-07"),
    status: "Draft",
  },
]

const updatedAllFiles = allFiles.map((file) => ({
  ...file,
  sentTo: file.uploadedBy,
}))

export default function Dashboard() {
  const { toast, dismiss } = useToast()

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
      <div className="flex flex-col">
        <div className="flex flex-1">
          <aside className="hidden w-64 flex-col border-r border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md md:flex">
            <Sidebar />
          </aside>
          <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recently modified</h2>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {recentlyModifiedFiles.map((file) => (
                  <Card key={file.id} className="overflow-hidden bg-[#1a1a1a]/80 backdrop-blur-md border-[#333] text-white">
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                      {file.icon}
                      <div className="grid gap-1">
                        <CardTitle className="text-sm">{file.name}</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{file.size}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">All files</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      type="search" 
                      placeholder="Search..." 
                      className="w-full rounded-lg pl-8 md:w-[300px] bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-400" 
                    />
                  </div>
                  <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
                    Filters
                  </Button>
                </div>
              </div>
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
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updatedAllFiles.map((file) => (
                      <TableRow key={file.id} className="border-[#333] hover:bg-[#333]/50">
                        <TableCell>
                          <Checkbox className="border-[#333]" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {file.type === "docx" ? (
                              <FileText className="h-5 w-5 text-[#edb5b5]" />
                            ) : file.type === "pdf" ? (
                              <FileText className="h-5 w-5 text-[#edb5b5]" />
                            ) : (
                              <Grid className="h-5 w-5 text-[#edb5b5]" />
                            )}
                            <div className="font-medium">{file.name}</div>
                            <div className="text-xs text-gray-400">{file.size}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={file.sentTo.avatar} alt={file.sentTo.name} />
                              <AvatarFallback>{file.sentTo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{file.sentTo.name}</div>
                              <div className="text-xs text-gray-400">{file.sentTo.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              file.status === "Draft"
                                ? "bg-[#1a1a1a] text-gray-400 border-[#333]"
                                : file.status === "Sent"
                                  ? "bg-[#1a1a1a] text-[#edb5b5] border-[#edb5b5]"
                                  : file.status === "Signed"
                                    ? "bg-[#1a1a1a] text-green-400 border-green-400"
                                    : file.status === "Reviewed"
                                      ? "bg-[#1a1a1a] text-purple-400 border-purple-400"
                                      : file.status === "Approved"
                                        ? "bg-[#1a1a1a] text-[#edb5b5] border-[#edb5b5]"
                                        : "bg-[#1a1a1a] text-red-400 border-red-400"
                            }
                          >
                            {file.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-400">{format(file.lastModified, "MMM d, yyyy")}</div>
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
                              <DropdownMenuItem className="hover:bg-[#333]">Rename</DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-[#333]">Open in browser</DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-[#333]">Available offline</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400 hover:bg-[#333]">Delete file</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-center p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled className="border-[#333] text-white">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 border-[#333] text-white hover:bg-[#333]">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 border-[#333] text-white hover:bg-[#333]">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 border-[#333] text-white hover:bg-[#333]">
                      3
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 border-[#333] text-white hover:bg-[#333]">
                      4
                    </Button>
                    <Button variant="outline" size="icon" className="border-[#333] text-white hover:bg-[#333]">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex h-10 items-center gap-2 px-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src="/placeholder.svg?height=24&width=24" alt="Freya Browning" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium">Freya Browning</div>
      </div>
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center">
        <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333]">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
        <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333]">
          <FileText className="h-4 w-4" />
          <span>Templates</span>
        </Button>
        <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333]">
          <BarChart className="h-4 w-4" />
          <span>Analysis</span>
        </Button>
      </nav>
      <div className="mt-auto grid gap-1 px-2">
        <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333]">
          <ShieldCheck className="h-4 w-4" />
          <span>Support</span>
        </Button>
        <Button variant="ghost" className="justify-start gap-2 hover:bg-[#333]">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>
      </div>
    </div>
  )
}

// Add the LogOut icon component
function LogOut({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

function MobileSidebar() {
  return <Sidebar />
}

function Menu({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function ChevronLeft({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ExternalLink({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  )
}

function PlusIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function Share2({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  )
} 