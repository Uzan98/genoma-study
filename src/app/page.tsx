'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Activity, Book, Brain, Clock, FlaskConical, Trophy } from 'lucide-react'
import ProgressCard from '../components/dashboard/ProgressCard'
import RecommendationCard from '../components/dashboard/RecommendationCard'
import QuickAccessCard from '../components/dashboard/QuickAccessCard'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function Home() {
  const { user } = useUser()
  const { theme } = useTheme()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Olá, {user?.name || 'Estudante'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Vamos continuar sua jornada de estudos?
          </p>
        </motion.div>

        {/* Seção de Progresso */}
        <motion.section variants={itemVariants} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Seu Progresso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProgressCard
              title="Flashcards Revisados"
              value={85}
              icon={<Brain className="w-6 h-6" />}
              color="bg-purple-500"
            />
            <ProgressCard
              title="Simulados Realizados"
              value={60}
              icon={<FlaskConical className="w-6 h-6" />}
              color="bg-blue-500"
            />
            <ProgressCard
              title="Tempo de Estudo"
              value={75}
              icon={<Clock className="w-6 h-6" />}
              color="bg-indigo-500"
            />
          </div>
        </motion.section>

        {/* Seção de Recomendações */}
        <motion.section variants={itemVariants} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Recomendações Personalizadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecommendationCard
              title="Revisar Flashcards de Biologia"
              description="Você tem 20 cards pendentes de revisão"
              icon={<Book className="w-6 h-6" />}
              href="/flashcards/biologia"
            />
            <RecommendationCard
              title="Simulado de Química"
              description="Novo simulado disponível baseado no seu perfil"
              icon={<Activity className="w-6 h-6" />}
              href="/simulados/quimica"
            />
          </div>
        </motion.section>

        {/* Seção de Acesso Rápido */}
        <motion.section variants={itemVariants}>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAccessCard
              title="Flashcards"
              description="Revise seus cards"
              href="/flashcards"
              icon={<Brain className="w-6 h-6" />}
              color="bg-purple-500"
            />
            <QuickAccessCard
              title="Simulados"
              description="Pratique questões"
              href="/simulados"
              icon={<FlaskConical className="w-6 h-6" />}
              color="bg-blue-500"
            />
            <QuickAccessCard
              title="Conquistas"
              description="Veja seu progresso"
              href="/conquistas"
              icon={<Trophy className="w-6 h-6" />}
              color="bg-indigo-500"
            />
            <QuickAccessCard
              title="Estudos"
              description="Material didático"
              href="/estudos"
              icon={<Book className="w-6 h-6" />}
              color="bg-violet-500"
            />
          </div>
        </motion.section>
      </div>
    </motion.main>
  )
} 