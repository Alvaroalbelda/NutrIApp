'use client'
console.log("Rendering Home page v2");
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-8">
      <h1 className="text-4xl font-extrabold text-green-800 mb-6">
        Bienvenido a Nutrición AI 🍏
      </h1>

      <p className="text-lg text-green-700 mb-8 text-center max-w-md">
        Tu nutricionista online personalizado. Regístrate o inicia sesión para comenzar tu plan.
      </p>

      <div className="flex space-x-4">
        <Link
          href="/register"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Registrarse
        </Link>

        <Link
          href="/login"
          className="px-6 py-3 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  )
}
