'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navigation from '@/components/Navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SummaryPage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUserAndLoadStats()
  }, [])

  const checkUserAndLoadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    setUser(user)
    await calculateStats(user.id)
    setLoading(false)
  }

  const calculateStats = async (userId) => {
    // Get logs from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: logs, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: true })

    if (error || !logs) {
      console.error('Error fetching logs:', error)
      return
    }

    // Calculate statistics
    const totalLogs = logs.length

    // Count tag frequency
    const tagCount = {}
    logs.forEach(log => {
      if (log.tags && Array.isArray(log.tags)) {
        log.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })

    // Get top 3 symptoms
    const topSymptoms = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }))

    // Prepare chart data - count logs per day
    const dailyCount = {}
    logs.forEach(log => {
      const date = new Date(log.log_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      dailyCount[date] = (dailyCount[date] || 0) + 1
    })

    const chartData = Object.entries(dailyCount).map(([date, count]) => ({
      date,
      logs: count
    }))

    setStats({
      totalLogs,
      topSymptoms,
      chartData
    })
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
            Weekly Health Summary
          </h2>
          <p className="text-gray-600">
            Your health insights for the last 7 days
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Logs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Total Logs</div>
            <div className="text-4xl font-bold text-blue-600">{stats?.totalLogs || 0}</div>
            <div className="text-sm text-gray-500 mt-1">entries this week</div>
          </div>

          {/* Most Common Symptom */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Top Symptom</div>
            <div className="text-2xl font-bold text-green-600">
              {stats?.topSymptoms[0]?.tag || 'None'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stats?.topSymptoms[0]?.count || 0} times logged
            </div>
          </div>

          {/* Average per Day */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Daily Average</div>
            <div className="text-4xl font-bold text-purple-600">
              {stats?.totalLogs ? (stats.totalLogs / 7).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-gray-500 mt-1">logs per day</div>
          </div>
        </div>

        {/* Top Symptoms */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Most Common Symptoms
          </h3>
          {stats?.topSymptoms && stats.topSymptoms.length > 0 ? (
            <div className="space-y-3">
              {stats.topSymptoms.map((symptom, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{symptom.tag}</span>
                      <span className="text-sm text-gray-600">{symptom.count} times</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(symptom.count / (stats.topSymptoms[0]?.count || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No symptoms logged this week
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Daily Log Activity
          </h3>
          {stats?.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="logs" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p>No data to display</p>
              <p className="text-sm">Start logging to see your weekly trends</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}