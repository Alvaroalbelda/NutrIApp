// src/app/layout.tsx
import { ReactNode } from 'react'
import MenuToggle from '@/components/MenuToggle'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-green-50 min-h-screen">
        <MenuToggle />
        {children}
      </body>
    </html>
  )
}
