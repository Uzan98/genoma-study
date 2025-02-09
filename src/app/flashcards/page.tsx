'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Brain, BookOpen, ChartBar, Edit, Trash2, Upload, X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useFlashcardsStore } from '@/store/useFlashcardsStore'

export default function FlashcardsPage() {
  const { decks, deletarDeck, adicionarDeck } = useFlashcardsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  // Estatísticas gerais
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0)
  const totalEstudos = decks.reduce((sum, deck) => 
    sum + deck.cards.reduce((cardSum, card) => cardSum + card.totalEstudos, 0), 0)
  
  // Calcula a média apenas para cards que já foram estudados
  const cardsEstudados = decks.reduce((sum, deck) => 
    sum + deck.cards.filter(card => card.totalEstudos > 0).length, 0)
  
  const somaAcertos = decks.reduce((sum, deck) => 
    sum + deck.cards.reduce((cardSum, card) => 
      cardSum + (card.totalEstudos > 0 ? (card.acertos / card.totalEstudos) * 100 : 0), 0
    ), 0)
  
  const mediaAcertos = cardsEstudados > 0 ? somaAcertos / cardsEstudados : 0

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Valida o formato do arquivo
      if (!Array.isArray(data)) {
        throw new Error('O arquivo deve conter um array de decks')
      }

      // Valida cada deck
      data.forEach((deck, index) => {
        if (!deck.titulo || !deck.descricao || !Array.isArray(deck.cards)) {
          throw new Error(`Deck ${index + 1} está com formato inválido`)
        }

        deck.cards.forEach((card: any, cardIndex: number) => {
          if (!card.front || !card.back) {
            throw new Error(`Card ${cardIndex + 1} do deck "${deck.titulo}" está com formato inválido`)
          }
        })
      })

      // Importa os decks
      data.forEach((deck) => {
        adicionarDeck({
          titulo: deck.titulo,
          descricao: deck.descricao,
          cards: deck.cards.map((card: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            front: card.front,
            back: card.back,
            totalEstudos: 0,
            acertos: 0,
            erros: 0,
            ultimoEstudo: null
          }))
        })
      })

      setShowImportModal(true)
      setImportError(null)
    } catch (error) {
      setShowImportModal(true)
      setImportError(error instanceof Error ? error.message : 'Erro ao importar arquivo')
    }

    // Limpa o input
    e.target.value = ''
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Padrão de DNA Estilizado */}
        <div className="absolute top-20 -left-20 w-[40rem] h-[40rem] bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-[35rem] h-[35rem] bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_500px_at_50%_50%,rgba(120,119,198,0.05),transparent)]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-12">
          <div className="relative">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 mb-3">
              Meus Flashcards
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Gerencie e estude seus flashcards
            </p>
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-2xl" />
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportClick}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/5 border border-gray-200/50 dark:border-gray-700/50 transition-all"
            >
              <Upload className="w-5 h-5" />
              Importar Decks
            </motion.button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <Link href="/flashcards/novo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Plus className="w-5 h-5" />
                Novo Deck
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-indigo-500/5 border-2 border-indigo-500/20 dark:border-indigo-400/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Total de Cards</h3>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300">
              {totalCards}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-emerald-500/5 border-2 border-emerald-500/20 dark:border-emerald-400/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Total de Estudos</h3>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">
              {totalEstudos}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-violet-500/5 border-2 border-violet-500/20 dark:border-violet-400/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-xl">
                <ChartBar className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Média de Acertos</h3>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-400 dark:to-violet-300">
              {mediaAcertos.toFixed(1)}%
            </p>
          </motion.div>
        </div>

        {/* Lista de Decks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            // Calcula a taxa de acertos do deck
            const deckEstudos = deck.cards.reduce((sum, card) => sum + card.totalEstudos, 0)
            const deckAcertos = deck.cards.reduce((sum, card) => sum + card.acertos, 0)
            const taxaAcertos = deckEstudos > 0 ? (deckAcertos / deckEstudos) * 100 : 0

            // Define a cor do deck baseada na taxa de acertos
            let colorClass = 'border-blue-500/20 dark:border-blue-400/20'
            let iconColorClass = 'text-blue-600 dark:text-blue-400'
            let bgIconClass = 'bg-blue-100 dark:bg-blue-900/50'
            let gradientClass = 'from-blue-500/5'
            let textGradientClass = 'from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300'

            if (deckEstudos > 0) {
              if (taxaAcertos >= 80) {
                colorClass = 'border-emerald-500/20 dark:border-emerald-400/20'
                iconColorClass = 'text-emerald-600 dark:text-emerald-400'
                bgIconClass = 'bg-emerald-100 dark:bg-emerald-900/50'
                gradientClass = 'from-emerald-500/5'
                textGradientClass = 'from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300'
              } else if (taxaAcertos >= 60) {
                colorClass = 'border-amber-500/20 dark:border-amber-400/20'
                iconColorClass = 'text-amber-600 dark:text-amber-400'
                bgIconClass = 'bg-amber-100 dark:bg-amber-900/50'
                gradientClass = 'from-amber-500/5'
                textGradientClass = 'from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-300'
              } else {
                colorClass = 'border-rose-500/20 dark:border-rose-400/20'
                iconColorClass = 'text-rose-600 dark:text-rose-400'
                bgIconClass = 'bg-rose-100 dark:bg-rose-900/50'
                gradientClass = 'from-rose-500/5'
                textGradientClass = 'from-rose-600 to-rose-400 dark:from-rose-400 dark:to-rose-300'
              }
            }

            return (
              <motion.div
                key={deck.id}
                layout
                whileHover={{ scale: 1.02 }}
                className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-purple-500/5 border-2 ${colorClass} relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${bgIconClass} rounded-xl`}>
                      <BookOpen className={`w-5 h-5 ${iconColorClass}`} />
                    </div>
                    <h3 className={`text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r ${textGradientClass}`}>
                      {deck.titulo}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/flashcards/${deck.id}/editar`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 ${iconColorClass}`}
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deletarDeck(deck.id)}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {deck.descricao}
                </p>

                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <span className="flex items-center gap-1">
                    <BookOpen className={`w-4 h-4 ${iconColorClass}`} />
                    {deck.cards.length} cards
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain className={`w-4 h-4 ${iconColorClass}`} />
                    {deckEstudos} estudos
                  </span>
                </div>

                <div className="flex gap-2 relative z-10">
                  <Link 
                    href={`/flashcards/${deck.id}/cards`} 
                    className={`flex-1 w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border ${colorClass} flex items-center justify-center`}
                  >
                    Ver Cards
                  </Link>
                  <Link 
                    href={`/flashcards/${deck.id}/estudar`} 
                    className={`flex-1 w-full px-4 py-2 ${
                      taxaAcertos >= 80
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                        : taxaAcertos >= 60
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                        : taxaAcertos > 0
                        ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500'
                    } hover:brightness-110 text-white rounded-xl font-medium transition-all flex items-center justify-center`}
                  >
                    Estudar
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Modal de Importação */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-md w-full mx-4 border border-gray-200/50 dark:border-gray-700/50"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                  {importError ? 'Erro na Importação' : 'Importação Concluída'}
                </h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {importError ? (
                <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <p>{importError}</p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  Os decks foram importados com sucesso! Você já pode começar a estudá-los.
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl"
                >
                  Fechar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
} 