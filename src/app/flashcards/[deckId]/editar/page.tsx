'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFlashcardsStore } from '@/store/useFlashcardsStore'
import type { Card } from '@/store/useFlashcardsStore'

export default function EditDeckPage({ params }: { params: { deckId: string } }) {
  const router = useRouter()
  const { getDeck, updateDeck, addDeck } = useFlashcardsStore()
  const existingDeck = getDeck(params.deckId)
  const isNewDeck = params.deckId === 'novo'

  const [deck, setDeck] = useState({
    id: isNewDeck ? Date.now().toString() : params.deckId,
    title: existingDeck?.title || '',
    description: existingDeck?.description || '',
    cards: existingDeck?.cards || []
  })

  const [newCard, setNewCard] = useState<Omit<Card, 'id'>>({
    front: '',
    back: '',
    interval: 0,
    easeFactor: 2.5,
    nextReview: new Date().toISOString(),
    repetitions: 0
  })

  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importText, setImportText] = useState('')

  useEffect(() => {
    if (!existingDeck && !isNewDeck) {
      router.push('/flashcards')
    }
  }, [existingDeck, isNewDeck, router])

  const handleAddCard = () => {
    if (newCard.front.trim() && newCard.back.trim()) {
      setDeck(prev => ({
        ...prev,
        cards: [
          ...prev.cards,
          {
            id: Date.now().toString(),
            ...newCard
          }
        ]
      }))
      setNewCard({
        front: '',
        back: '',
        interval: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        repetitions: 0
      })
    }
  }

  const handleRemoveCard = (cardId: string) => {
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== cardId)
    }))
  }

  const handleUpdateDeck = () => {
    if (!deck.title.trim()) {
      alert('Por favor, adicione um título ao deck')
      return
    }

    if (deck.cards.length === 0) {
      alert('Por favor, adicione pelo menos um card ao deck')
      return
    }

    if (isNewDeck) {
      addDeck({
        title: deck.title,
        description: deck.description,
        cards: deck.cards
      })
    } else {
      updateDeck(deck.id, {
        title: deck.title,
        description: deck.description,
        cards: deck.cards
      })
    }
    router.push('/flashcards')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddCard()
    }
  }

  const processImportedText = () => {
    const cleanText = importText.trim()
    
    const cardsTexts = cleanText.split('//').filter(text => text.trim())
    
    const newCards = cardsTexts.map(cardText => {
      const [front, back] = cardText.split('/').map(text => text.trim())
      
      if (!front || !back) {
        throw new Error('Todos os cards devem ter frente e verso')
      }

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        front,
        back,
        interval: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        repetitions: 0
      }
    })

    setDeck(prev => ({
      ...prev,
      cards: [...prev.cards, ...newCards]
    }))

    setImportText('')
    setShowImportDialog(false)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/flashcards">
          <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </Link>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUpdateDeck}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Salvar Deck
        </motion.button>
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence>
          {showImportDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Importar Cards em Massa
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Cole seu texto no formato:
                  <br />
                  <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 text-sm">
                    enunciado1<br />
                    /<br />
                    resposta1<br />
                    //<br />
                    enunciado2<br />
                    /<br />
                    resposta2
                  </code>
                </p>

                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                  placeholder="Cole seu texto aqui..."
                />

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowImportDialog(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      try {
                        processImportedText()
                      } catch (error) {
                        alert('Erro ao processar o texto. Verifique o formato.')
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                  >
                    Importar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowImportDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Importar Cards em Massa
            </motion.button>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {isNewDeck ? 'Criar Novo Deck' : 'Editar Deck'}
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título do Deck
              </label>
              <input
                type="text"
                value={deck.title}
                onChange={(e) => setDeck(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o título do deck"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                value={deck.description}
                onChange={(e) => setDeck(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite uma breve descrição do deck"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Adicionar Novo Card
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frente
              </label>
              <textarea
                value={newCard.front}
                onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o conteúdo da frente do card"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verso
              </label>
              <textarea
                value={newCard.back}
                onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o conteúdo do verso do card"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddCard}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar Card (Ctrl + Enter)
            </motion.button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Cards no Deck ({deck.cards.length})
          </h2>
          
          <div className="space-y-4">
            {deck.cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Card {index + 1}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveCard(card.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frente
                    </label>
                    <textarea
                      value={card.front}
                      onChange={(e) => {
                        const updatedCards = [...deck.cards]
                        updatedCards[index] = { ...card, front: e.target.value }
                        setDeck(prev => ({ ...prev, cards: updatedCards }))
                      }}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Verso
                    </label>
                    <textarea
                      value={card.back}
                      onChange={(e) => {
                        const updatedCards = [...deck.cards]
                        updatedCards[index] = { ...card, back: e.target.value }
                        setDeck(prev => ({ ...prev, cards: updatedCards }))
                      }}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
} 