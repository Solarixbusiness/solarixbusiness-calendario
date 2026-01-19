'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarEvent } from '@/lib/types'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    description: string
    start: Date
    end: Date
    color: string
  }) => void
  onDelete?: () => void
  event: CalendarEvent | null
  initialSlot: { start: Date; end: Date } | null
  canEdit: boolean
  userColor: string
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  initialSlot,
  canEdit,
  userColor,
}: AppointmentModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [color, setColor] = useState(userColor)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setStartDate(format(event.start, 'yyyy-MM-dd'))
      setStartTime(format(event.start, 'HH:mm'))
      setEndDate(format(event.end, 'yyyy-MM-dd'))
      setEndTime(format(event.end, 'HH:mm'))
      setColor(event.color || event.creatorColor)
    } else if (initialSlot) {
      setTitle('')
      setDescription('')
      setStartDate(format(initialSlot.start, 'yyyy-MM-dd'))
      setStartTime(format(initialSlot.start, 'HH:mm'))
      setEndDate(format(initialSlot.end, 'yyyy-MM-dd'))
      setEndTime(format(initialSlot.end, 'HH:mm'))
      setColor(userColor)
    }
    setErrors({})
  }, [event, initialSlot, userColor])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio'
    }

    if (!startDate || !startTime) {
      newErrors.start = 'Data e ora di inizio sono obbligatorie'
    }

    if (!endDate || !endTime) {
      newErrors.end = 'Data e ora di fine sono obbligatorie'
    }

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    if (start >= end) {
      newErrors.end = 'La data di fine deve essere successiva a quella di inizio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    onSave({
      title: title.trim(),
      description: description.trim(),
      start,
      end,
      color,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {event ? (canEdit ? 'Modifica Appuntamento' : 'Dettagli Appuntamento') : 'Nuovo Appuntamento'}
            </h3>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {event && !canEdit && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                Questo appuntamento è stato creato da {event.creatorName}. Solo il creatore può modificarlo.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Es: Riunione team"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data inizio *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!canEdit}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.start ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ora inizio *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!canEdit}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.start ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            {errors.start && <p className="text-red-500 text-xs -mt-2">{errors.start}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data fine *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!canEdit}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.end ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ora fine *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!canEdit}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.end ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            {errors.end && <p className="text-red-500 text-xs -mt-2">{errors.end}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Note aggiuntive..."
              />
            </div>


            <div className="flex justify-between pt-4">
              {onDelete && canEdit ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                >
                  Elimina
                </button>
              ) : (
                <div />
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  {canEdit ? 'Annulla' : 'Chiudi'}
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Salva
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
