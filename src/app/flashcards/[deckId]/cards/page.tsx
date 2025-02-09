'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Brain, ChartBar, Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFlashcardsStore } from '@/store/useFlashcardsStore'
import { use } from 'react'

interface PageProps {
  params: Promise<{ deckId: string }>
}

export default function CardsPage({ params }: PageProps) {
  const router = useRouter()
  const { deckId } = use(params)
  const { getDeck } = useFlashcardsStore()
  const deck = getDeck(deckId)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  if (!deck) return null

  const filteredCards = deck.cards.filter(card => 
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(filteredCards.map(card => card.id))
    }
  }

  const getPerformanceInfo = (card: any) => {
    const taxa = card.totalEstudos > 0 ? (card.acertos / card.totalEstudos) * 100 : 0

    if (taxa <= 50) {
      return {
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-50 dark:bg-rose-950',
        borderColor: 'border-rose-500/20 dark:border-rose-400/20',
        gradientClass: 'from-rose-500/5',
        textGradientClass: 'from-rose-600 to-rose-400 dark:from-rose-400 dark:to-rose-300',
        icon: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
      }
    } else if (taxa <= 70) {
      return {
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950',
        borderColor: 'border-amber-500/20 dark:border-amber-400/20',
        gradientClass: 'from-amber-500/5',
        textGradientClass: 'from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-300',
        icon: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      }
    } else {
      return {
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950',
        borderColor: 'border-emerald-500/20 dark:border-emerald-400/20',
        gradientClass: 'from-emerald-500/5',
        textGradientClass: 'from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300',
        icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-[40rem] h-[40rem] bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-[35rem] h-[35rem] bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_500px_at_50%_50%,rgba(120,119,198,0.05),transparent)]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/flashcards">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </motion.button>
          </Link>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectAll}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/5 border border-gray-200/50 dark:border-gray-700/50 transition-all"
            >
              {selectedCards.length === filteredCards.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </motion.button>
            <Link 
              href={`/flashcards/${deckId}/estudar?cards=${selectedCards.join(',')}`}
              className={selectedCards.length === 0 ? 'pointer-events-none opacity-50' : ''}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20"
                disabled={selectedCards.length === 0}
              >
                <Brain className="w-5 h-5" />
                Estudar Selecionados ({selectedCards.length})
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Título do Deck */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 mb-3">
            {deck.titulo}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {deck.descricao}
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar cards..."
            className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg shadow-purple-500/5"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Lista de Cards */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {filteredCards.map((card) => {
            const performance = getPerformanceInfo(card)
            const taxaAcertos = card.totalEstudos > 0
              ? ((card.acertos / card.totalEstudos) * 100).toFixed(1)
              : '0.0'

            return (
              <motion.div
                key={card.id}
                layout
                whileHover={{ scale: 1.02 }}
                className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 ${performance.borderColor} relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${performance.gradientClass} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex items-start gap-4 relative z-10">
                  <input
                    type="checkbox"
                    checked={selectedCards.includes(card.id)}
                    onChange={() => handleCardSelect(card.id)}
                    className="mt-1.5 h-5 w-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                          Frente
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {card.front}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                          Verso
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {card.back}
                        </p>
                      </div>
                    </div>

                    {/* Estatísticas do Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 rounded-xl p-4">
                        {performance.icon}
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Taxa de Acerto
                          </p>
                          <p className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${performance.textGradientClass}`}>
                            {taxaAcertos}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 rounded-xl p-4">
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total de Estudos
                          </p>
                          <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300">
                            {card.totalEstudos}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 rounded-xl p-4">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Último Estudo
                          </p>
                          <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
                            {card.ultimoEstudo
                              ? new Date(card.ultimoEstudo).toLocaleDateString('pt-BR')
                              : 'Nunca estudado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
} 