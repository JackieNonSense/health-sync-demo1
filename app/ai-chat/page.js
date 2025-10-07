'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navigation from '@/components/Navigation'

export default function AIChatPage() {
  const [user, setUser] = useState(null)
  const [userPlan, setUserPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUserAndPlan()
  }, [])

  const checkUserAndPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    setUser(user)

    // Check user's plan from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserPlan(profile.plan)
    }

    setLoading(false)
  }

  const handleUpgrade = async () => {
    setUpgrading(true)

    try {
      // Mock payment: just update the plan to 'pro'
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('id', user.id)

      if (error) throw error

      setUserPlan('pro')
      alert('Welcome to Pro! 🎉')
    } catch (error) {
      alert('Upgrade failed: ' + error.message)
    } finally {
      setUpgrading(false)
    }
  }

const handleSendMessage = async (e) => {
  e.preventDefault()
  if (!input.trim() || sending) return

  setSending(true)

  // Add user message
  const userMessage = { role: 'user', content: input }
  const newMessages = [...messages, userMessage]
  setMessages(newMessages)
  setInput('')

  try {
    // Call our API route
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: newMessages
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // Add AI response
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.reply
    }])
  } catch (error) {
    console.error('Chat error:', error)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.'
    }])
  } finally {
    setSending(false)
  }
}

  const generateAIResponse = (userInput) => {
    const lower = userInput.toLowerCase()

    // Simple keyword-based responses
    if (lower.includes('tired') || lower.includes('fatigue')) {
      return "Based on your symptoms, here are some suggestions: 1) Ensure you're getting 7-9 hours of sleep, 2) Stay hydrated throughout the day, 3) Consider light exercise to boost energy. If fatigue persists, consult a healthcare provider."
    }

    if (lower.includes('headache') || lower.includes('head')) {
      return "For headaches, try: 1) Rest in a quiet, dark room, 2) Apply a cold compress to your forehead, 3) Stay hydrated, 4) Practice relaxation techniques. If headaches are severe or frequent, please see a doctor."
    }

    if (lower.includes('dizzy') || lower.includes('dizziness')) {
      return "Dizziness can have various causes. Try: 1) Sit or lie down immediately, 2) Drink water, 3) Avoid sudden movements. If dizziness persists or is accompanied by other symptoms, seek medical attention."
    }

    if (lower.includes('anxiety') || lower.includes('stress')) {
      return "To manage anxiety: 1) Practice deep breathing exercises, 2) Try mindfulness or meditation, 3) Maintain regular exercise, 4) Get adequate sleep. Consider speaking with a mental health professional if anxiety interferes with daily life."
    }

    if (lower.includes('hello') || lower.includes('hi')) {
      return "Hello! I'm your AI health assistant. I can provide general wellness tips based on your symptoms. How can I help you today?"
    }

    // Default response
    return "I understand you're experiencing health concerns. Based on your logs, I recommend: 1) Maintain consistent sleep schedule, 2) Stay hydrated, 3) Track patterns in your symptoms, 4) Consult with a healthcare provider for persistent issues. What specific aspect would you like to discuss?"
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        {userPlan === 'free' ? (
          // Paywall - Free Users
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Health Assistant
            </h2>

            <p className="text-xl text-gray-600 mb-8">
              Unlock personalized health insights with our AI-powered assistant
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Pro Features:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">24/7 AI health assistant</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Personalized health recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Pattern analysis and insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Unlimited chat messages</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Demo mode: Click to instantly unlock Pro features
            </p>
          </div>
        ) : (
          // AI Chat - Pro Users
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 text-white">
              <h2 className="text-2xl font-bold">AI Health Assistant</h2>
              <p className="text-sm opacity-90">Ask me anything about your health</p>
            </div>

            {/* Messages */}
            <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">How can I help you today?</p>
                  <p className="text-sm mt-2">Try asking about your symptoms or health concerns</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}