'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function TestDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-4 border-b border-border">
      <div className="relative">
        <button
          onClick={() => {
            console.log('Button clicked!')
            setIsOpen(!isOpen)
          }}
          className="w-full flex items-center justify-between px-3 py-2 bg-background border rounded-lg hover:bg-accent"
        >
          <span>Test Dropdown</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 p-1">
            <div 
              className="px-3 py-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => {
                console.log('Item clicked!')
                setIsOpen(false)
              }}
            >
              Test Item 1
            </div>
            <div 
              className="px-3 py-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => {
                console.log('Item clicked!')
                setIsOpen(false)
              }}
            >
              Test Item 2
            </div>
          </div>
        )}
      </div>
    </div>
  )
}