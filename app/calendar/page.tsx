import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/app/components/Header'
import CalendarView from './components/CalendarView'

export default async function CalendarPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email || 'Utente'
  const userColor = profile?.avatar_color || '#3B82F6'

  // Get all profiles for displaying creator names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url(/images/bg-pattern.png)',
          backgroundSize: '400px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      />
      
      <div className="relative z-10">
        <Header userName={userName} userColor={userColor} />
        <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 md:py-6">
          <CalendarView 
            userId={user.id} 
            userName={userName}
            userColor={userColor}
            userEmail={user.email || ''}
            profiles={profiles || []}
          />
        </main>
      </div>
    </div>
  )
}
