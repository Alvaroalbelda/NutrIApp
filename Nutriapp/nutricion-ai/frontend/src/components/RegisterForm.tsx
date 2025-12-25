// src/components/RegisterForm.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type FormData = {
  full_name: string
  email: string
  password: string
  acceptTerms: boolean
}

export default function RegisterForm() {
  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    acceptTerms: false,
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones básicas
    if (!form.full_name || !form.email || !form.password) {
      setError('Nombre completo, correo y contraseña son obligatorios')
      return
    }
    if (!form.acceptTerms) {
      setError('Debe aceptar los términos y condiciones')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await response.json()
      console.log('Registro respuesta:', response.status, data)

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro')
      }

      // Éxito → redirigir al formulario de completar perfil
      router.push('/complete-profile')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-4 bg-white rounded-md shadow"
    >
      {error && <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>}

      <div>
        <label className="block font-semibold">Nombre completo</label>
        <input
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">Correo electrónico</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">Contraseña</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="inline-flex items-center">
          <input
            name="acceptTerms"
            type="checkbox"
            checked={form.acceptTerms}
            onChange={handleChange}
            className="mr-2"
          />
          Acepto los términos y condiciones
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  )
}
