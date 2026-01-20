// src/app/verify-pending/page.tsx
export default function VerifyPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-green-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-2">Verifica tu cuenta</h1>
        <p className="text-gray-700">
          Te hemos enviado un correo con un enlace de verificación.
          <br />
          Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para continuar.
        </p>
      </div>
    </main>
  )
}
