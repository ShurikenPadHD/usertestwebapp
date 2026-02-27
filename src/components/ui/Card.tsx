import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered'
}

export function Card({ className, variant = 'glass', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-[#1a1a1a] border border-white/5',
    glass: 'bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5',
    bordered: 'bg-transparent border border-white/10',
  }

  return (
    <div 
      className={twMerge('rounded-2xl p-6', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}
