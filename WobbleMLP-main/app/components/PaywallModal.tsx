'use client'
import React from 'react'

export default function PaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h2 className="text-lg font-bold mb-2">Quota exceeded</h2>
        <p className="mb-4">You've hit your monthly quota. Upgrade your plan to continue.</p>
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">
          Close
        </button>
      </div>
    </div>
  )
}
