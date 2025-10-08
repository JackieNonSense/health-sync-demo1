'use client'

import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform hover:scale-105 transition-transform duration-300">

          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Activity className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Health Sync
            </h1>
            <p className="text-gray-600">
              Track your health, visualize your progress
            </p>
          </div>

          {/* Main CTA */}
          <Link
            href="/auth"
            className="block w-full px-6 py-4 bg-blue-600 text-white text-center rounded-lg font-semibold text-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          >
            Get Started
          </Link>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            Demo Project · Built with Next.js & Supabase
          </p>
        </div>
      </div>
    </div>
  )
}
