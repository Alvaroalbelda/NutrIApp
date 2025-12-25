// src/app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

// (Opcional) importar librería para enviar email
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, password } = body

    // Validaciones básicas
    if (!full_name || !email || !password) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 })
    }

    // Verificar que no exista usuario con ese email
    const { data: existing, error: existsError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existsError && existsError.code !== 'PGRST116') {
      // error inesperado
      console.error('Error comprobando email existente:', existsError)
      return NextResponse.json({ message: 'Error interno' }, { status: 500 })
    }
    if (existing) {
      return NextResponse.json({ message: 'El email ya está en uso' }, { status: 409 })
    }

    // Hashear la contraseña
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Generar token de verificación
    const verification_token = randomUUID()

    // Insertar el usuario en la base de datos con is_verified = false
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        password_hash,
        is_verified: false,
        verification_token,
      })

    if (insertError) {
      console.error('Error insertando usuario:', insertError)
      return NextResponse.json({ message: 'Error al registrar usuario' }, { status: 500 })
    }

    // Enviar email de verificación (opcional o en producción)
    try {
      // Configura tu transporte SMTP o librería de correo
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verification_token}`

      await transporter.sendMail({
        from: `"Nutricion AI" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Verifica tu correo - Nutricion AI',
        html: `<p>Hola ${full_name},</p>
               <p>Por favor verifica tu cuenta haciendo clic en el enlace:</p>
               <p><a href="${verificationUrl}">Verificar cuenta</a></p>
               <p>Si no solicitaste esto, ignora este mensaje.</p>`,
      })
    } catch (mailErr) {
      console.error('Error enviando email de verificación:', mailErr)
      // Puedes decidir no fallar todo el proceso por el email
    }

    return NextResponse.json({ message: 'Usuario creado, revise su correo para verificar' }, { status: 201 })
  } catch (err: any) {
    console.error('Error en route POST /api/users:', err)
    return NextResponse.json({ message: 'Error interno', error: err.message }, { status: 500 })
  }
}
