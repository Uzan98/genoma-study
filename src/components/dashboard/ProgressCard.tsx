import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ProgressCardProps {
  title: string
  value: number
  icon: ReactNode
  color: string
}

export default function ProgressCard({ title, value, icon, color }: ProgressCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`${color} p-2 rounded-lg text-white`}>{icon}</div>
        <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-right">
            <span className="text-xl font-semibold inline-block text-gray-800 dark:text-white">
              {value}%
            </span>
          </div>
        </div>
        <div className="flex h-2 mb-4 overflow-hidden bg-gray-200 rounded">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`${color} rounded`}
          />
        </div>
      </div>
    </motion.div>
  )
} 