import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const getVariant = (): BadgeProps['variant'] => {
    switch (status) {
      case 'Available':
        return 'success'
      case 'UnderContract':
        return 'warning'
      case 'Leased':
      case 'Sold':
        return 'default'
      case 'New':
        return 'info'
      case 'Contacted':
        return 'warning'
      case 'Closed':
        return 'default'
      default:
        return 'default'
    }
  }

  const getLabel = (): string => {
    switch (status) {
      case 'UnderContract':
        return 'Under Contract'
      default:
        return status
    }
  }

  return <Badge variant={getVariant()}>{getLabel()}</Badge>
}
