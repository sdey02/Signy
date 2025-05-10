import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Dancing_Script } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })
const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: '--font-dancing-script'
})

export const metadata: Metadata = {
  title: "Signy - An All-In-One Agreements Platform",
  description:
    "The best solution for creating and managing contracts, streamlining negotiations, enhancing compliance, optimizing workflows, and converting more customers.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

