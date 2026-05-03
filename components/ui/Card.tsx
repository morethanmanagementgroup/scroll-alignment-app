import React from 'react'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'dark'
  className?: string
  onClick?: () => void
}

const variants = {
  default: 'scroll-card',
  gold:    'scroll-card-gold',
  dark:    'bg-scroll-deep border border-scroll-border rounded-xl',
}

export default function Card({ children, variant = 'default', className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`${variants[variant]} p-6 ${onClick ? 'cursor-pointer hover:border-scroll-gold/40 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
