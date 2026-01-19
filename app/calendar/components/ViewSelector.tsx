'use client'

import { View } from 'react-big-calendar'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface ViewSelectorProps {
  view: View
  onViewChange: (view: View) => void
  date: Date
  onDateChange: (date: Date) => void
  onNewAppointment: () => void
}

export default function ViewSelector({
  view,
  onViewChange,
  date,
  onDateChange,
  onNewAppointment,
}: ViewSelectorProps) {
  const handlePrevious = () => {
    const newDate = new Date(date)
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(date)
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const getDateLabel = () => {
    if (view === 'month') {
      return format(date, 'MMMM yyyy', { locale: it })
    } else if (view === 'week') {
      const start = new Date(date)
      start.setDate(start.getDate() - start.getDay() + 1)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return `${format(start, 'd MMM', { locale: it })} - ${format(end, 'd MMM yyyy', { locale: it })}`
    } else {
      return format(date, 'EEEE d MMMM yyyy', { locale: it })
    }
  }

  return (
    <div className="px-3 py-2 md:px-4 md:py-3 bg-white border-b border-gray-200">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Row 1: View selector tabs */}
        <div className="flex items-center justify-center bg-orange-50 rounded-xl p-1">
          {(['day', 'week', 'month'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                onViewChange(v)
                onDateChange(new Date())
              }}
              className={`flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg transition ${
                view === v
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-orange-600 hover:bg-orange-100'
              }`}
            >
              {v === 'day' ? 'Giorno' : v === 'week' ? 'Sett.' : 'Mese'}
            </button>
          ))}
        </div>

        {/* Row 2: Date navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="p-2.5 hover:bg-orange-50 rounded-xl transition active:bg-orange-100"
            aria-label="Precedente"
          >
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex flex-col items-center">
            <h2 className="text-base font-bold text-gray-800 capitalize">
              {getDateLabel()}
            </h2>
            <button
              onClick={handleToday}
              className="text-xs font-medium text-orange-600 hover:text-orange-700"
            >
              Vai a oggi
            </button>
          </div>
          
          <button
            onClick={handleNext}
            className="p-2.5 hover:bg-orange-50 rounded-xl transition active:bg-orange-100"
            aria-label="Successivo"
          >
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={onNewAppointment}
          className="fixed bottom-6 right-6 flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white w-14 h-14 rounded-full font-medium transition shadow-xl z-50"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:items-center md:justify-between gap-4">
        <button
          onClick={onNewAppointment}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuovo Appuntamento</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-white rounded-lg transition"
              aria-label="Precedente"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-white rounded-lg transition"
            >
              Oggi
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-white rounded-lg transition"
              aria-label="Successivo"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 min-w-[220px] text-center capitalize">
            {getDateLabel()}
          </h2>
        </div>

        <div className="flex items-center bg-orange-50 rounded-xl p-1">
          {(['day', 'week', 'month'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                onViewChange(v)
                onDateChange(new Date())
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                view === v
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-orange-600 hover:bg-orange-100'
              }`}
            >
              {v === 'day' ? 'Giorno' : v === 'week' ? 'Settimana' : 'Mese'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
