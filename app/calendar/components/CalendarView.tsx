'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { it } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { createClient } from '@/lib/supabase/client'
import { Profile, Appointment, CalendarEvent } from '@/lib/types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _Profile = {} as Profile // Keep import used
import AppointmentModal from './AppointmentModal'
import ViewSelector from './ViewSelector'

const locales = { 'it': it }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

interface CalendarViewProps {
  userId: string
  userName: string
  userColor: string
  profiles: Profile[]
}

export default function CalendarView({ userId, userColor }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [, setIsMobile] = useState(false)
  const [view, setView] = useState<View>('day')
  const [date, setDate] = useState(new Date())

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && view === 'week') {
        setView('day')
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [view])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    
    // Fetch appointments
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: true })

    if (aptError) {
      console.error('Error fetching appointments:', aptError)
      setLoading(false)
      return
    }

    // Fetch all profiles
    const { data: profilesData, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_color')

    if (profError) {
      console.error('Error fetching profiles:', profError)
    }

    // Create a map of profiles by id
    const profilesMap = new Map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (profilesData || []).map((p: any) => [p.id, p])
    )

    if (appointments) {
      const calendarEvents: CalendarEvent[] = appointments.map((apt: Appointment) => {
        const profile = profilesMap.get(apt.created_by)
        return {
          id: apt.id,
          title: apt.title,
          start: new Date(apt.start_time),
          end: new Date(apt.end_time),
          description: apt.description,
          color: apt.color || profile?.avatar_color || '#3B82F6',
          createdBy: apt.created_by,
          creatorName: profile?.full_name || 'Utente',
          creatorColor: profile?.avatar_color || '#3B82F6',
        }
      })
      setEvents(calendarEvents)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAppointments()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAppointments, supabase])

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedSlot(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
  }

  const handleSaveAppointment = async (appointmentData: {
    title: string
    description: string
    start: Date
    end: Date
    color: string
  }) => {
    if (selectedEvent) {
      // Update existing appointment
      const { error } = await supabase
        .from('appointments')
        .update({
          title: appointmentData.title,
          description: appointmentData.description,
          start_time: appointmentData.start.toISOString(),
          end_time: appointmentData.end.toISOString(),
          color: appointmentData.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedEvent.id)

      if (error) {
        console.error('Error updating appointment:', error)
        alert('Errore durante l\'aggiornamento dell\'appuntamento')
        return
      }
    } else {
      // Create new appointment
      const { data, error } = await supabase.from('appointments').insert({
        title: appointmentData.title,
        description: appointmentData.description,
        start_time: appointmentData.start.toISOString(),
        end_time: appointmentData.end.toISOString(),
        color: appointmentData.color,
        created_by: userId,
      }).select()

      console.log('Insert result:', { data, error, userId })

      if (error) {
        console.error('Error creating appointment:', error)
        alert('Errore durante la creazione dell\'appuntamento: ' + error.message)
        return
      }
    }

    handleCloseModal()
    fetchAppointments()
  }

  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return

    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', selectedEvent.id)

    if (error) {
      console.error('Error deleting appointment:', error)
      alert('Errore durante l\'eliminazione dell\'appuntamento')
      return
    }

    handleCloseModal()
    fetchAppointments()
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color || event.creatorColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 6px',
      },
    }
  }

  const messages = {
    today: 'Oggi',
    previous: '←',
    next: '→',
    month: 'Mese',
    week: 'Settimana',
    day: 'Giorno',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Ora',
    event: 'Evento',
    noEventsInRange: 'Nessun appuntamento in questo periodo',
    showMore: (total: number) => `+${total} altri`,
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <ViewSelector
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        onNewAppointment={() => {
          setSelectedSlot({ start: new Date(), end: new Date(Date.now() + 60 * 60 * 1000) })
          setSelectedEvent(null)
          setIsModalOpen(true)
        }}
      />

      <div className="p-2 md:p-4" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            views={['day', 'week', 'month']}
            onView={setView}
            date={date}
            onNavigate={setDate}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            culture="it"
            min={new Date(0, 0, 0, 7, 0, 0)}
            max={new Date(0, 0, 0, 21, 0, 0)}
            step={30}
            timeslots={2}
            toolbar={false}
            defaultView="day"
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) =>
                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
              dayHeaderFormat: (date) => format(date, 'EEE d', { locale: it }),
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, 'd MMM', { locale: it })} - ${format(end, 'd MMM yyyy', { locale: it })}`,
              weekdayFormat: (date) => format(date, 'EEE', { locale: it }),
            }}
            components={{
              event: ({ event }) => {
                const initials = event.creatorName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <div className="truncate">
                    <span className="font-bold">{initials}:</span>
                    <span className="font-medium ml-1">{event.title}</span>
                  </div>
                )
              },
            }}
          />
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
        onDelete={selectedEvent && selectedEvent.createdBy === userId ? handleDeleteAppointment : undefined}
        event={selectedEvent}
        initialSlot={selectedSlot}
        canEdit={!selectedEvent || selectedEvent.createdBy === userId}
        userColor={userColor}
      />
    </div>
  )
}
