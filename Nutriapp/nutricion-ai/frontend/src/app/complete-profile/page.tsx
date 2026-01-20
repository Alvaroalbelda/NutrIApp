'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type ProfileForm = {
  gender: 'male' | 'female' | 'other' | ''
  weight_kg: string
  height_cm: string
  diet_type: string
  goal: string
  favorites: string // lo escribimos como texto separado por comas
}

export default function CompleteProfilePage() {
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileForm>({
    gender: '',
    weight_kg: '',
    height_cm: '',
    diet_type: '',
    goal: '',
    favorites: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('user_id')
    setUserId(id)
    if (!id) setError('No hay user_id. Regístrate primero.')
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!userId) {
      setError('No hay user_id. Regístrate primero.')
      return
    }

    // Validaciones simples
    const weight = form.weight_kg ? Number(form.weight_kg) : null
    const height = form.height_cm ? Number(form.height_cm) : null

    if (weight !== null && (Number.isNaN(weight) || weight <= 0)) {
      setError('Peso inválido')
      return
    }
    if (height !== null && (Number.isNaN(height) || height <= 0)) {
      setError('Altura inválida')
      return
    }
    if (form.gender && !['male', 'female', 'other'].includes(form.gender)) {
      setError('Sexo inválido')
      return
    }

    const favoritesArray = form.favorites
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)

    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/complete-profile`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            gender: form.gender || null,
            weight_kg: weight,
            height_cm: height,
            diet_type: form.diet_type || null,
            goal: form.goal || null,
            favorites: favoritesArray,
          }),
        }
      )

      const data = await response.json()
      console.log('complete-profile:', response.status, data)

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Error al completar perfil')
      }

      setSuccess('Perfil completado correctamente ✅')

      // siguiente paso: ir a la página de generar dieta (cuando exista)
      // router.push('/diet')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full space-y-4"
      >
        <h1 className="text-2xl font-bold text-green-700">
          Completar perfil
        </h1>

        {error && (
          <div className="text-red-700 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-700 bg-green-100 p-2 rounded">
            {success}
          </div>
        )}

        <div className="text-sm text-gray-600">
          user_id: <span className="font-mono">{userId ?? '—'}</span>
        </div>

        <div>
          <label className="block font-semibold">Sexo</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">(Opcional)</option>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Peso (kg)</label>
          <input
            name="weight_kg"
            value={form.weight_kg}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Ej: 72.5"
          />
        </div>

        <div>
          <label className="block font-semibold">Altura (cm)</label>
          <input
            name="height_cm"
            value={form.height_cm}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Ej: 175"
          />
        </div>

        <div>
          <label className="block font-semibold">Tipo de dieta</label>
          <input
            name="diet_type"
            value={form.diet_type}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Ej: mediterránea, vegetariana..."
          />
        </div>

        <div>
          <label className="block font-semibold">Objetivo</label>
          <input
            name="goal"
            value={form.goal}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Ej: perder grasa, ganar músculo..."
          />
        </div>

        <div>
          <label className="block font-semibold">
            Alimentos favoritos (separados por comas)
          </label>
          <input
            name="favorites"
            value={form.favorites}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="pollo, arroz, salmón..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 w-full"
        >
          {loading ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </form>
    </main>
  )
}
