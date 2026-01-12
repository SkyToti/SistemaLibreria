import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mrbeelector POS",
  description: "Sistema de gestión para puesto de libros",
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preload" href="/background_login.svg" as="image" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  )
}
