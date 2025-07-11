"use client"

import dynamic from "next/dynamic"

// Dynamically import the App component with no SSR
const App = dynamic(() => import("../src/App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading chat application...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return <App />
}
