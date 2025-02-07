'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Check, X, RotateCcw, Calendar, HelpCircle, Target, Brain, Award } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFlashcardsStore, Card } from '@/store/useFlashcardsStore'
import Dialog from '@/components/ui/Dialog'
import HelpDialog from '@/components/ui/HelpDialog'

interface StudyStats {
  correct: number
  incorrect: number
  timeSpent: number
  wrongCards: Card[]
}

interface StudyCard extends Card {
  sessionScore: number // Pontuação na sessão atual (quanto menor, mais precisa revisar)
  reviewCount: number // Número de vezes que foi revisado na sessão
}

interface StudyHistory {
  card: StudyCard
  isCorrect: boolean
  round: number
}

interface PageProps {
  params: Promise<{ deckId: string }>
}

export default function StudyPage({ params }: PageProps) {
  const router = useRouter()
  const { deckId } = use(params)
  const { getDeck, updateStudyProgress, updateCardProgress, getDueCards } = useFlashcardsStore()
  const deck = getDeck(deckId)

  // Usa apenas os cards que precisam de revisão
  const dueCards = getDueCards(deckId)
  const [cards, setCards] = useState(dueCards)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [timer, setTimer] = useState(0)
  const [stats, setStats] = useState<StudyStats>({
    correct: 0,
    incorrect: 0,
    timeSpent: 0,
    wrongCards: []
  })
  const [showStats, setShowStats] = useState(false)
  const [studyComplete, setStudyComplete] = useState(false)
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [hasShownDialog, setHasShownDialog] = useState(false)
  const [sessionCards, setSessionCards] = useState<StudyCard[]>([])
  const [remainingCards, setRemainingCards] = useState<StudyCard[]>([])
  const [round, setRound] = useState(1)
  const maxRounds = 3 // Máximo de rodadas por sessão
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [studyHistory, setStudyHistory] = useState<StudyHistory[]>([])

  useEffect(() => {
    if (!deck) {
      router.push('/flashcards')
      return
    }

    // Só mostra o diálogo na primeira vez e se não houver cards para estudar
    if (dueCards.length === 0 && !hasShownDialog && remainingCards.length === 0) {
      setShowDialog(true)
      setHasShownDialog(true)
    }
  }, [deck, router, dueCards, hasShownDialog, remainingCards.length])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!studyComplete) {
        setTimer((prev) => prev + 1)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [studyComplete])

  // Inicializa os cards da sessão
  useEffect(() => {
    if (cards.length > 0) {
      const initialSessionCards = cards.map(card => ({
        ...card,
        sessionScore: 0.5,
        reviewCount: 0
      }))
      setSessionCards(initialSessionCards)
      setRemainingCards(initialSessionCards)
      setCurrentCardIndex(0)
    }
  }, [cards])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (quality: number) => {
    if (remainingCards.length === 0) return

    const currentCard = remainingCards[0]
    const isCorrect = quality >= 3

    // Adiciona ao histórico
    setStudyHistory(prev => [...prev, {
      card: currentCard,
      isCorrect,
      round
    }])

    // Atualiza o progresso do card no sistema de repetição espaçada
    updateCardProgress(deckId, currentCard.id, quality)

    // Atualiza a pontuação da sessão e o contador de revisões
    const scoreChange = (() => {
      switch (quality) {
        case 1: return -0.3 // Muito Difícil
        case 3: return 0.2  // Com Esforço
        case 5: return 0.4  // Fácil
        default: return 0
      }
    })()

    const newSessionCards = sessionCards.map(card =>
      card.id === currentCard.id
        ? {
            ...card,
            sessionScore: Math.max(0, Math.min(1, card.sessionScore + scoreChange)),
            reviewCount: card.reviewCount + 1
          }
        : card
    )
    setSessionCards(newSessionCards)

    // Remove o card atual dos cards restantes
    const newRemainingCards = remainingCards.slice(1)
    setRemainingCards(newRemainingCards)

    // Atualiza estatísticas
    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }))
    } else {
      setStats(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        wrongCards: [...prev.wrongCards, currentCard]
      }))
    }

    // Mostra a data da próxima revisão
    const nextDate = new Date(currentCard.nextReview)
    const formattedDate = nextDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    setNextReviewDate(formattedDate)

    // Reseta o estado do card
    setIsFlipped(false)

    // Verifica se precisa iniciar uma nova rodada
    if (newRemainingCards.length === 0) {
      if (round < maxRounds) {
        // Prepara os cards para a próxima rodada
        const sortedCards = [...newSessionCards].sort((a, b) => {
          // Primeiro critério: pontuação da sessão (menor primeiro)
          const scoreDiff = a.sessionScore - b.sessionScore
          if (Math.abs(scoreDiff) > 0.1) return scoreDiff

          // Segundo critério: número de revisões (menor primeiro)
          return a.reviewCount - b.reviewCount
        })

        console.log('Round:', round, 'Max Rounds:', maxRounds)
        console.log('Session scores:', sortedCards.map(c => ({ 
          id: c.id, 
          score: c.sessionScore,
          reviews: c.reviewCount 
        })))

        // Inicia nova rodada com todos os cards, ordenados por prioridade
        setRemainingCards(sortedCards)
        setRound(round + 1)
        console.log('Iniciando nova rodada:', round + 1)
      } else {
        // Finaliza o estudo após todas as rodadas
        console.log('Finalizando estudo')
        const finalStats = {
          correct: stats.correct + (isCorrect ? 1 : 0),
          incorrect: stats.incorrect + (isCorrect ? 0 : 1),
          timeSpent: timer,
          wrongCards: isCorrect ? stats.wrongCards : [...stats.wrongCards, currentCard]
        }
        setStats(finalStats)
        
        if (deck) {
          updateStudyProgress(
            deck.id,
            finalStats.correct,
            sessionCards.reduce((sum, card) => sum + card.reviewCount, 0),
            finalStats.wrongCards
          )
        }

        // Mostra as estatísticas apenas se houver cards errados para revisar
        if (finalStats.wrongCards.length > 0) {
          setShowStats(true)
        } else {
          setStudyComplete(true)
        }
      }
    }
  }

  const restartWithWrongCards = () => {
    if (stats.wrongCards.length > 0) {
      const wrongCardsForStudy = stats.wrongCards.map(card => ({
        ...card,
        sessionScore: 0.5,
        reviewCount: 0
      }))
      setCards(stats.wrongCards)
      setSessionCards(wrongCardsForStudy)
      setRemainingCards(wrongCardsForStudy)
      setCurrentCardIndex(0)
      setIsFlipped(false)
      setShowStats(false)
      setStudyComplete(false)
      setStats({
        correct: 0,
        incorrect: 0,
        timeSpent: 0,
        wrongCards: []
      })
      setTimer(0)
      setRound(1)
    }
  }

  if (!deck) {
    return null
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Dialog
        isOpen={showDialog && remainingCards.length === 0}
        onClose={() => {
          setShowDialog(false)
          router.push('/flashcards')
        }}
        title="Nenhum Card para Estudar"
        description="Não há cards para estudar neste momento. Você pode visualizar todos os cards do deck ou voltar para a lista de decks."
      >
        <button
          onClick={() => {
            setShowDialog(false)
            const initialCards = deck?.cards || []
            const initialSessionCards = initialCards.map(card => ({
              ...card,
              sessionScore: 0.5,
              reviewCount: 0
            }))
            setCards(initialCards)
            setRemainingCards(initialSessionCards)
            setSessionCards(initialSessionCards)
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
        >
          Visualizar Cards
        </button>
        <button
          onClick={() => {
            setShowDialog(false)
            router.push('/flashcards')
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
        >
          Voltar para Decks
        </button>
      </Dialog>

      <HelpDialog
        isOpen={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/flashcards">
            <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHelpDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Como Funciona?</span>
          </motion.button>
        </div>
        {dueCards.length === 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            Modo Visualização
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* History Panel */}
        <div className="w-80">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Histórico da Sessão
            </h2>

            {studyHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Nenhum card estudado ainda
              </p>
            ) : (
              <div className="space-y-4">
                {studyHistory.map((item, index) => (
                  <div
                    key={`${item.card.id}-${index}`}
                    className={`p-4 rounded-lg ${
                      item.isCorrect 
                        ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Rodada {item.round}
                      </span>
                      {item.isCorrect ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.card.front}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Section */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!showStats ? (
              <motion.div
                key="card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div 
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg cursor-pointer min-h-[400px] relative"
                  onClick={handleCardFlip}
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Frente do Card */}
                    <motion.div
                      className="absolute w-full h-full flex items-center justify-center"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        {remainingCards[0]?.front || ''}
                      </h2>
                    </motion.div>

                    {/* Verso do Card */}
                    <motion.div
                      className="absolute w-full h-full flex items-center justify-center"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        {remainingCards[0]?.back || ''}
                      </h2>
                    </motion.div>
                  </motion.div>
                </div>

                {isFlipped && (
                  <>
                    {/* Modo Estudo */}
                    {!studyComplete && (
                      <div className="flex justify-center gap-4 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(1)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Muito Difícil
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(3)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                        >
                          <Clock className="w-5 h-5" />
                          Com Esforço
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(5)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Fácil
                        </motion.button>
                      </div>
                    )}

                    {/* Modo Visualização */}
                    {studyComplete && (
                      <div className="flex justify-center gap-4 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsFlipped(false)
                            if (currentCardIndex < cards.length - 1) {
                              setCurrentCardIndex(prev => prev + 1)
                            } else {
                              router.push('/flashcards')
                            }
                          }}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                        >
                          {currentCardIndex < cards.length - 1 ? (
                            <>
                              <ArrowLeft className="w-5 h-5 rotate-180" />
                              Próximo Card
                            </>
                          ) : (
                            <>
                              <ArrowLeft className="w-5 h-5" />
                              Finalizar
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}

                    {nextReviewDate && !studyComplete && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-center text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        <span>Próxima revisão: {nextReviewDate}</span>
                      </motion.div>
                    )}
                  </>
                )}

                <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
                  Card {cards.length - remainingCards.length + 1} de {cards.length}
                  {round > 1 && <span className="ml-2">(Rodada {round})</span>}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
              >
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                  Resultado do Estudo
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-500 mb-2">
                      {stats.correct}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">Acertos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-500 mb-2">
                      {stats.incorrect}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">Erros</div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    {Math.round((stats.correct / cards.length) * 100)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Taxa de Acerto
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="text-xl text-gray-600 dark:text-gray-300">
                    Tempo Total: {formatTime(stats.timeSpent)}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={restartWithWrongCards}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Revisar Cards Errados ({stats.wrongCards.length})
                  </motion.button>
                  
                  <Link href="/flashcards" className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                    >
                      Finalizar
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Panel */}
        <div className="w-80">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Estatísticas da Sessão
            </h2>

            {/* Round Info */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 mb-2">
                <span>Rodada Atual</span>
                <span className="font-medium">{round}/{maxRounds}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 mb-2">
                <span>Tempo de Estudo</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{formatTime(timer)}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 mb-2">
                <span>Progresso</span>
                <span className="font-medium">{currentCardIndex + 1}/{cards.length}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500"
                  style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Acertos</span>
                </div>
                <span className="font-medium text-green-500 dark:text-green-400">{stats.correct}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="text-gray-700 dark:text-gray-300">Erros</span>
                </div>
                <span className="font-medium text-red-500 dark:text-red-400">{stats.incorrect}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <span className="text-gray-700 dark:text-gray-300">Taxa de Acerto</span>
              </div>
                <span className="font-medium text-purple-500 dark:text-purple-400">
                  {stats.correct + stats.incorrect > 0
                    ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  <span className="text-gray-700 dark:text-gray-300">Para Revisar</span>
                </div>
                <span className="font-medium text-yellow-500 dark:text-yellow-400">{stats.wrongCards.length}</span>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Cards Restantes</span>
                </div>
                <span className="font-medium text-blue-500 dark:text-blue-400">{remainingCards.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-gray-700 dark:text-gray-300">Total de Revisões</span>
              </div>
                <span className="font-medium text-indigo-500 dark:text-indigo-400">
                  {sessionCards.reduce((sum, card) => sum + card.reviewCount, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 