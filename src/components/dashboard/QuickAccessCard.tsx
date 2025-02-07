import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode } from 'react'

interface QuickAccessCardProps {
  title: string
  description: string
  icon: ReactNode
  href: string
  color: string
}

export default function QuickAccessCard({
  title,
  description,
  icon,
  href,
  color
}: QuickAccessCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg cursor-pointer h-full"
      >
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {description}
        </p>
      </motion.div>
    </Link>
  )
} 