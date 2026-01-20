// src/app/verify/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params

  if (!token) {
    return NextResponse.json({ message: 'Token no proporcionado' }, { status: 400 })
  }

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, is_verified, verification_token')
    .eq('verification_token', token)
    .single()

  if (fetchError || !user) {
    console.error('Error al buscar usuario por token:', fetchError)
    return NextResponse.json({ message: 'Token inválido' }, { status: 400 })
  }

  if (user.is_verified) {
    // ya verificado → lo mandamos a completar perfil o a login
    return NextResponse.redirect(new URL('/complete-profile', request.url))
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ is_verified: true, verification_token: null })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error al verificar usuario:', updateError)
    return NextResponse.json({ message: 'Error al verificar cuenta' }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/complete-profile', request.url))
}
