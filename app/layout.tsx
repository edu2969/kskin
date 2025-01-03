import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KSkin - Tu lugar de transformación',
  description: 'by Eduardo Troncoso',
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  return (    
    <html lang="es-CL">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@100..900&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Zeyada&display=swap" rel="stylesheet"/>
      </head>
      <body className={inter.className}>
        {children}        
      </body>
    </html>
  )
}
