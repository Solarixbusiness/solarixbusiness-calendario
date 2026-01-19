'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenziali non valide. Riprova.')
      setLoading(false)
    } else {
      router.push('/calendar')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600">
      {/* Top area with logo */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="text-center px-4">
          <Image
            src="/images/logo-full.png"
            alt="SolarixBusiness"
            width={280}
            height={280}
            className="w-48 md:w-64 mx-auto drop-shadow-2xl"
            priority
          />
          <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg mt-4">
            Calendario Team
          </h1>
        </div>
      </div>

      {/* Login card */}
      <div className="bg-white rounded-t-[2rem] px-6 pt-8 pb-8 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6 max-w-sm mx-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-gray-50 text-gray-800"
              placeholder="nome@solarixbusiness.it"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-gray-50 text-gray-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 mt-2"
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
        
        <p className="text-center text-gray-400 text-xs mt-8 pb-2">
          © {new Date().getFullYear()} SolarixBusiness
        </p>
      </div>
    </div>
  )
}
