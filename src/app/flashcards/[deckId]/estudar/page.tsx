'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, Check, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFlashcardsStore } from '@/store/useFlashcardsStore'
import { use } from 'react'

interface PageProps {
  params: Promise<{ deckId: string }>
}

export default function EstudoPage({ params }: PageProps) {
  const router = useRouter()
  const { deckId } = use(params)
  const { getDeck, atualizarProgresso } = useFlashcardsStore()
  const deck = getDeck(deckId)

  const [cards, setCards] = useState(deck?.cards || [])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState({
    acertos: 0,
    erros: 0,
    tempoEstudo: 0,
  })
  const [timer, setTimer] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (!deck) {
      router.push('/flashcards')
      return
    }

    // Verifica se há cards específicos para estudar na URL
    const searchParams = new URLSearchParams(window.location.search)
    const selectedCardIds = searchParams.get('cards')?.split(',')

    // Filtra os cards se houver seleção, senão usa todos
    const cardsToStudy = selectedCardIds
      ? deck.cards.filter(card => selectedCardIds.includes(card.id))
      : deck.cards

    // Embaralha os cards
    const shuffledCards = [...cardsToStudy].sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
  }, [deck, router])

  // Timer
  useEffect(() => {
    if (showStats) return

    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [showStats])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCardFlip = () => {
    if (!showStats) {
      setIsFlipped(!isFlipped)
      // Scroll suave para os botões
      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight * 0.8,
          behavior: 'smooth'
        })
      }, 300)
    }
  }

  const handleAnswer = (acertou: boolean) => {
    if (showStats) return

    // Scroll suave de volta para o topo
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    // Atualiza o progresso do card
    const currentCard = cards[currentCardIndex]
    atualizarProgresso(deckId, currentCard.id, acertou)

    // Atualiza as estatísticas
    setStats(prev => ({
      ...prev,
      acertos: prev.acertos + (acertou ? 1 : 0),
      erros: prev.erros + (acertou ? 0 : 1),
      tempoEstudo: timer,
    }))

    // Avança para o próximo card
    if (currentCardIndex < cards.length - 1) {
      setDirection(1)
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1)
        setIsFlipped(false)
      }, 300)
    } else {
      setShowStats(true)
    }
  }

  const handleRestart = () => {
    setCards(prev => [...prev].sort(() => Math.random() - 0.5))
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowStats(false)
    setStats({
      acertos: 0,
      erros: 0,
      tempoEstudo: 0,
    })
    setTimer(0)
  }

  if (!deck) return null

  const progressPercentage = ((currentCardIndex + 1) / cards.length) * 100

  // Adiciona cálculos de estatísticas
  const taxaAcertos = stats.acertos + stats.erros > 0
    ? ((stats.acertos / (stats.acertos + stats.erros)) * 100).toFixed(1)
    : '0.0'

  const cardAtual = cards[currentCardIndex]
  const taxaAcertosCard = cardAtual?.totalEstudos > 0
    ? ((cardAtual.acertos / cardAtual.totalEstudos) * 100).toFixed(1)
    : '0.0'

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Painel Lateral Esquerdo */}
          <div className="col-span-2">
            <div className="sticky top-8 space-y-4">
              {/* Estatísticas da Sessão */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 text-gray-900 dark:text-white border-2 border-purple-300 dark:border-purple-700 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Sessão Atual</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Taxa de Acertos</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{taxaAcertos}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tempo Total</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(timer)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Cards Estudados</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentCardIndex + 1}/{cards.length}</p>
                  </div>
                </div>
              </div>

              {/* Dicas de Estudo */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 text-gray-900 dark:text-white border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Dicas</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400">•</span>
                    Clique no card para ver a resposta
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400">•</span>
                    Seja honesto com suas respostas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400">•</span>
                    Revise os erros ao final
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="col-span-8">
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
            {!showStats && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {currentCardIndex + 1}/{cards.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Título do Deck */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 mb-4">
              {deck.titulo}
            </h1>
            {!showStats && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>

          {/* Área de Estudo */}
          {!showStats ? (
            <div className="space-y-8">
              {/* Card */}
              <div className="relative perspective-[1000px] h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardIndex}
                    initial={{ 
                      rotateY: direction === 1 ? -90 : 90,
                      opacity: 0 
                    }}
                    animate={{ 
                      rotateY: isFlipped ? 180 : 0,
                      opacity: 1
                    }}
                    exit={{ 
                      rotateY: direction === 1 ? 90 : -90,
                      opacity: 0
                    }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full cursor-pointer"
                    onClick={handleCardFlip}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Frente do Card */}
                    <div
                      className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex items-center justify-center backface-hidden transform-gpu"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-2xl text-gray-900 dark:text-white text-center font-medium"
                        >
                          {cards[currentCardIndex]?.front}
                        </motion.p>
                        <motion.div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          Clique para virar
                        </motion.div>
                      </div>
                    </div>

                    {/* Verso do Card */}
                    <div
                      className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex items-center justify-center backface-hidden transform-gpu"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl text-gray-900 dark:text-white text-center font-medium"
                      >
                        {cards[currentCardIndex]?.back}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Botões de Resposta */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex justify-center gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(false)}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                      Errei
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(true)}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Check className="w-5 h-5" />
                      Acertei
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Estatísticas */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
            >
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 mb-8 text-center">
                Resultado do Estudo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md text-center"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Acertos
                  </p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {stats.acertos}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md text-center"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Erros
                  </p>
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {stats.erros}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md text-center"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Tempo de Estudo
                  </p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {formatTime(stats.tempoEstudo)}
                  </p>
                </motion.div>
              </div>
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestart}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Estudar Novamente
                </motion.button>
              </div>
            </motion.div>
          )}
          </div>

          {/* Painel Lateral Direito */}
          <div className="col-span-2">
            <div className="sticky top-8 space-y-4">
              {/* Estatísticas do Card Atual */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 text-gray-900 dark:text-white border-2 border-purple-300 dark:border-purple-700 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Card Atual</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Taxa de Acertos</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{taxaAcertosCard}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total de Estudos</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cardAtual?.totalEstudos || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Último Estudo</p>
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">
                      {cardAtual?.ultimoEstudo 
                        ? new Date(cardAtual.ultimoEstudo).toLocaleDateString('pt-BR')
                        : 'Nunca estudado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 