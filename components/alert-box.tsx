import React from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface AlertBoxProps {
  title: string
  message: string
  isAlert: boolean
}

export default function AlertBox({ title, message, isAlert }: AlertBoxProps) {
  return (
    <div
      className={`p-4 rounded-lg border flex items-start gap-3 transition-all duration-300 ${
        isAlert
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-green-500/10 border-green-500/30 text-green-300'
      }`}
    >
      {isAlert ? (
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
      )}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </div>
  )
}
