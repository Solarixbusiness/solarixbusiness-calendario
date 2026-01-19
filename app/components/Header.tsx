'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  userName: string
  userColor: string
}

export default function Header({ userName, userColor }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 md:px-6 md:py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Image
            src="/images/logo.png"
            alt="SolarixBusiness"
            width={40}
            height={40}
            className="w-9 h-9 md:w-11 md:h-11 object-contain"
          />
          <div>
            <h1 className="text-base md:text-lg font-bold text-white">Calendario Team</h1>
            <p className="text-xs text-orange-100 hidden md:block">SolarixBusiness</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div
              className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm border-2 border-white/30"
              style={{ backgroundColor: userColor }}
            >
              {getInitials(userName)}
            </div>
            <span className="text-sm font-medium text-white hidden md:block">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 md:px-4 md:py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition"
            aria-label="Esci"
          >
            <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">Esci</span>
          </button>
        </div>
      </div>
    </header>
  )
}
