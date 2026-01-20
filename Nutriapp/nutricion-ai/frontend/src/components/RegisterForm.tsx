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

      // 🔐 Validación de contraseña (AQUÍ)
    if (form.password.length < 8 || form.password.length > 30) {
      setError('La contraseña debe tener entre 8 y 30 caracteres')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
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
        // FastAPI suele devolver { detail: "..." }
        throw new Error(data.detail || data.message || 'Error en el registro')
      }

      // ✅ Guardar user_id para usarlo en complete-profile
      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id)
      } else {
        throw new Error('El backend no devolvió user_id')
      }

      // Éxito → redirigir al formulario de completar perfil
      // ✅ Guardamos user_id para usarlo en complete-profile
      localStorage.setItem('user_id', data.user_id)

      // (Opcional, solo para DEV) guardamos el token para poder verificar sin email real
      if (data.verification_token) {
        localStorage.setItem('verification_token', data.verification_token)
      }

      // ✅ En vez de ir a complete-profile, vamos a una pantalla intermedia
      router.push('/verify-pending')

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
          minLength={8}
          maxLength={30}
          required
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
