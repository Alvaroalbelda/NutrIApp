// src/components/MenuToggle.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MenuToggle() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={() => setMenuOpen(!menuOpen)} className="...">
        N
      </button>
      {menuOpen && (
        <div className="...">
          <Link href="/register">Registrarse</Link>
          <Link href="/login">Iniciar sesión</Link>
        </div>
      )}
    </div>
  )
}
