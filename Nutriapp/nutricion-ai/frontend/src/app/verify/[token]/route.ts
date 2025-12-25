// src/app/verify/[token]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token

  if (!token) {
    return NextResponse.json({ message: 'Token no proporcionado' }, { status: 400 })
  }

  // Busca el usuario con ese token y que aún no esté verificado
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, is_verified, verification_token')
    .eq('verification_token', token)
    .single()

  if (fetchError) {
    console.error('Error al buscar usuario por token:', fetchError)
    return NextResponse.json({ message: 'Token inválido' }, { status: 400 })
  }

  if (!users || users.is_verified) {
    return NextResponse.json({ message: 'Usuario no encontrado o ya verificado' }, { status: 400 })
  }

  // Marcar usuario como verificado
  const { error: updateError } = await supabase
    .from('users')
    .update({ is_verified: true, verification_token: null }) // opcionalmente borrar el token
    .eq('id', users.id)

  if (updateError) {
    console.error('Error al verificar usuario:', updateError)
    return NextResponse.json({ message: 'Error al verificar cuenta' }, { status: 500 })
  }

  // Redirigir al usuario (por ejemplo) al formulario de completar perfil
  return NextResponse.redirect(new URL('/complete-profile', request.url))
}
