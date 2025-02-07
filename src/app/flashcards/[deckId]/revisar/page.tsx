'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Check, X, RotateCcw, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFlashcardsStore, Card } from '@/store/useFlashcardsStore'
import Dialog from '@/components/ui/Dialog'

interface StudyStats {
  correct: number
  incorrect: number
  timeSpent: number
  wrongCards: Card[]
}

interface PageProps {
  params: Promise<{ deckId: string }>
}

export default function ReviewPage({ params }: PageProps) {
  const router = useRouter()
  const { deckId } = use(params)
  const { getDeck, updateStudyProgress, updateCardProgress } = useFlashcardsStore()
  const deck = getDeck(deckId)

  const wrongCards = deck?.wrongCards || []
  const [cards, setCards] = useState(wrongCards)
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

  useEffect(() => {
    if (!deck) {
      router.push('/flashcards')
      return
    }

    if (wrongCards.length === 0 && !hasShownDialog) {
      setShowDialog(true)
      setHasShownDialog(true)
    }
  }, [deck, router, wrongCards, hasShownDialog])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!studyComplete) {
        setTimer((prev) => prev + 1)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [studyComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (correct: boolean) => {
    const currentCard = cards[currentCardIndex]
    const quality = correct ? 4 : 1 // 4 para "Agora Sei", 1 para "Ainda Não Sei"

    // Atualiza o progresso do card
    updateCardProgress(deckId, currentCard.id, quality)

    // Mostra a data da próxima revisão
    const nextDate = new Date(currentCard.nextReview)
    const formattedDate = nextDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    setNextReviewDate(formattedDate)

    if (correct) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }))
    } else {
      setStats(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        wrongCards: [...prev.wrongCards, currentCard]
      }))
    }

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      setStudyComplete(true)
      setShowStats(true)
      const finalStats = {
        correct: stats.correct + (correct ? 1 : 0),
        incorrect: stats.incorrect + (correct ? 0 : 1),
        timeSpent: timer,
        wrongCards: correct ? stats.wrongCards : [...stats.wrongCards, currentCard]
      }
      setStats(finalStats)
      
      if (deck) {
        // Atualiza o progresso mantendo apenas os cards que ainda estão errados
        updateStudyProgress(
          deck.id,
          finalStats.correct,
          cards.length,
          finalStats.wrongCards
        )
      }
    }
  }

  const restartWithWrongCards = () => {
    if (stats.wrongCards.length > 0) {
      setCards(stats.wrongCards)
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
    }
  }

  if (!deck || wrongCards.length === 0) {
    return null
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Dialog
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false)
          router.push('/flashcards')
        }}
        title="Nenhum Card para Revisar"
        description="Não há cards para revisar neste momento. Você pode visualizar todos os cards do deck ou voltar para a lista de decks."
      >
        <button
          onClick={() => {
            setShowDialog(false)
            setCards(deck?.cards || [])
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
      <div className="flex justify-between items-center mb-8">
        <Link href="/flashcards">
          <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </Link>
        <div className="flex items-center gap-4">
          {wrongCards.length === 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              Modo Visualização
            </span>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock className="w-5 h-5" />
            <span>{formatTime(timer)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {wrongCards.length > 0 ? 'Revisão de Cards Errados' : 'Visualização de Cards'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {wrongCards.length > 0 
            ? `Revise os ${cards.length} cards que você errou no último estudo`
            : `Visualize todos os ${cards.length} cards do deck`
          }
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showStats ? (
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg cursor-pointer min-h-[300px] relative"
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
                    {cards[currentCardIndex].front}
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
                    {cards[currentCardIndex].back}
                  </h2>
                </motion.div>
              </motion.div>
            </div>

            {isFlipped && wrongCards.length > 0 && (
              <>
                <div className="flex justify-center gap-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Ainda Não Sei
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Agora Sei
                  </motion.button>
                </div>

                {nextReviewDate && (
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

            {isFlipped && wrongCards.length === 0 && (
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

            <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
              Card {currentCardIndex + 1} de {cards.length}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              Resultado da Revisão
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500 mb-2">
                  {stats.correct}
                </div>
                <div className="text-gray-600 dark:text-gray-300">Aprendidos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-500 mb-2">
                  {stats.incorrect}
                </div>
                <div className="text-gray-600 dark:text-gray-300">Para Revisar</div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-2">
                {Math.round((stats.correct / cards.length) * 100)}%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Taxa de Aprendizado
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
                Revisar Novamente ({stats.wrongCards.length})
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
    </main>
  )
} 