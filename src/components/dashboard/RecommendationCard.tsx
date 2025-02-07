import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode } from 'react'

interface RecommendationCardProps {
  title: string
  description: string
  icon: ReactNode
  href: string
}

export default function RecommendationCard({
  title,
  description,
  icon,
  href
}: RecommendationCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer"
      >
        <div className="flex items-start gap-4">
          <div className="bg-purple-500 p-3 rounded-lg text-white">{icon}</div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  )
} 