'use client'

import { motion } from 'framer-motion'
import { Plus, BookOpen, Clock, ChartBar, Edit, Trash2, Brain, Target, Award, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useFlashcardsStore, type Deck, type Card } from '@/store/useFlashcardsStore'

export default function FlashcardsPage() {
  const { decks, deleteDeck } = useFlashcardsStore()

  // Cálculo das estatísticas gerais
  const totalCards = decks.reduce((sum, deck) => sum + deck.totalCards, 0)
  const totalWrongCards = decks.reduce((sum, deck) => sum + (deck.wrongCards?.length || 0), 0)
  const averageMastery = decks.length > 0
    ? Math.round(decks.reduce((sum, deck) => sum + deck.masteryLevel, 0) / decks.length)
    : 0
  const lastStudyDate = decks.length > 0
    ? new Date(Math.max(...decks.map(deck => new Date(deck.lastStudied).getTime())))
    : null

  const getNextReviewDate = (deck: Deck) => {
    if (!deck.cards || deck.cards.length === 0) return null

    // Encontra a data mais próxima de revisão entre todos os cards
    const nextReview = new Date(Math.min(
      ...deck.cards.map((card: Card) => new Date(card.nextReview).getTime())
    ))

    // Se a data for hoje ou anterior, retorna "Hoje"
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (nextReview <= today) {
      return "Hoje"
    }

    // Se for amanhã, retorna "Amanhã"
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (nextReview <= tomorrow) {
      return "Amanhã"
    }

    // Caso contrário, formata a data
    return nextReview.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Meus Flashcards
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gerencie e estude seus flashcards
          </p>
        </div>
        <Link href="/flashcards/novo">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Deck
          </motion.button>
        </Link>
      </div>

      {/* Painel de Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-purple-500/20 shadow-purple-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100/50 dark:bg-purple-900/20 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Cards</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{totalCards}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-blue-500/20 shadow-blue-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100/50 dark:bg-blue-900/20 p-2 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Domínio Médio</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{averageMastery}%</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-red-500/20 shadow-red-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-100/50 dark:bg-red-900/20 p-2 rounded-lg">
              <Award className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cards para Revisar</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{totalWrongCards}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-green-500/20 shadow-green-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100/50 dark:bg-green-900/20 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Último Estudo</p>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {lastStudyDate ? lastStudyDate.toLocaleDateString('pt-BR') : 'Nunca'}
              </h3>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {decks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            Você ainda não tem nenhum deck de flashcards
          </p>
          <Link href="/flashcards/novo">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Criar Meu Primeiro Deck
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              whileHover={{ scale: 1.03, translateY: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl"
            >
              {/* Cabeçalho do Card com Gradiente */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                      {deck.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{deck.totalCards} cards</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <ChartBar className="w-4 h-4" />
                      <span>{deck.masteryLevel}% dominado</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/flashcards/${deck.id}/editar`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteDeck(deck.id)}
                      className="text-red-500 hover:text-red-600 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Corpo do Card */}
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {deck.description}
                </p>

                {/* Estatísticas do Deck */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Último Estudo */}
                  <div className="col-span-1">
                    <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Último estudo</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        {new Date(deck.lastStudied).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Próxima Revisão */}
                  <div className="col-span-1">
                    <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">Próxima revisão</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 text-center">
                        {getNextReviewDate(deck)}
                      </span>
                    </div>
                  </div>

                  {/* Cards para Revisar */}
                  <div className="col-span-1">
                    <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      <Award className="w-5 h-5 text-red-500 dark:text-red-400 mb-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Para revisar</span>
                      <span className="text-sm font-medium text-red-500 dark:text-red-400 text-center">
                        {deck.wrongCards?.length || 0} cards
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Link href={`/flashcards/${deck.id}/estudar`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg font-medium shadow-sm"
                    >
                      Estudar Agora
                    </motion.button>
                  </Link>
                  {deck.wrongCards && deck.wrongCards.length > 0 && (
                    <Link href={`/flashcards/${deck.id}/revisar`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2"
                      >
                        <span>Revisar</span>
                        <span className="bg-blue-500 px-2 py-0.5 rounded-full text-sm">
                          {deck.wrongCards.length}
                        </span>
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  )
} 