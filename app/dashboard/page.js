'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navigation from '@/components/Navigation'
import HealthLogForm from '@/components/HealthLogForm'
import HealthCalendar from '@/components/HealthCalendar'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
    } else {
      setUser(user)
      fetchLogs(user.id)
    }
    setLoading(false)
  }

  const fetchLogs = async (userId) => {
    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching logs:', error)
    } else {
      setLogs(data || [])
    }
  }

  const handleLogAdded = () => {
    setShowForm(false)
    fetchLogs(user.id)
  }

  const handleDelete = async (logId) => {
    if (!confirm('Are you sure you want to delete this log?')) return

    const { error } = await supabase
      .from('health_logs')
      .delete()
      .eq('id', logId)

    if (error) {
      alert('Error deleting log')
    } else {
      fetchLogs(user.id)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Health Log
          </h2>
          <p className="text-gray-600">
            Track your symptoms and wellness data
          </p>
        </div>

        {/* Add Log Button / Form */}
        {!showForm ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition"
            >
              + Add New Health Log
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <HealthLogForm onLogAdded={handleLogAdded} />
            <button
              onClick={() => setShowForm(false)}
              className="mt-4 text-gray-600 hover:text-gray-900 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Recent Logs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Logs
          </h3>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <p>No health logs yet</p>
              <p className="text-sm">Click "Add New Health Log" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-600">
                      {new Date(log.log_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {log.symptoms && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-900">Symptoms: </span>
                      <span className="text-gray-700">{log.symptoms}</span>
                    </div>
                  )}

                  {log.tags && log.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {log.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <div className="text-gray-600 text-sm mt-2">
                      {log.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Calendar */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Health Calendar
          </h3>
          <HealthCalendar
            logs={logs}
            onDateClick={(date) => console.log('Clicked date:', date)}
          />
        </div>
      </main>
    </div>
  )
}