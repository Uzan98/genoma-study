import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Card {
  id: string
  front: string
  back: string
  interval: number // Intervalo em dias até a próxima revisão
  easeFactor: number // Fator de facilidade (começa em 2.5)
  nextReview: string // Data da próxima revisão
  repetitions: number // Número de revisões consecutivas corretas
}

export interface Deck {
  id: string
  title: string
  description: string
  totalCards: number
  lastStudied: string
  masteryLevel: number
  cards: Card[]
  wrongCards: Card[]
}

interface FlashcardsState {
  decks: Deck[]
  addDeck: (deck: Omit<Deck, 'id' | 'totalCards' | 'lastStudied' | 'masteryLevel' | 'wrongCards'>) => string
  updateDeck: (deckId: string, deck: Partial<Omit<Deck, 'wrongCards'>>) => void
  deleteDeck: (deckId: string) => void
  getDeck: (deckId: string) => Deck | undefined
  updateStudyProgress: (deckId: string, correct: number, total: number, wrongCards: Card[]) => void
  updateCardProgress: (deckId: string, cardId: string, quality: number) => void // Nova função para atualizar progresso do card
  getDueCards: (deckId: string) => Card[] // Nova função para obter cards que precisam de revisão
}

// Função auxiliar para calcular próxima revisão
const calculateNextReview = (card: Card, quality: number): Partial<Card> => {
  let { interval, easeFactor, repetitions } = card

  // Se errou (quality < 3), reseta o progresso
  if (quality < 3) {
    repetitions = 0
    interval = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else {
    repetitions += 1
    easeFactor = Math.max(1.3, easeFactor + 0.1 * (quality - 3))

    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 3
    else interval = Math.round(interval * easeFactor)
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReview.toISOString()
  }
}

// Função auxiliar para calcular o nível de domínio de um card
const calculateCardMastery = (card: Card): number => {
  // Fatores que influenciam o domínio:
  // 1. Intervalo atual (quanto maior, melhor)
  // 2. Fator de facilidade (quanto maior, melhor)
  // 3. Número de repetições consecutivas corretas
  // 4. Tempo até a próxima revisão

  const maxInterval = 365 // Consideramos 1 ano como intervalo máximo
  const maxEaseFactor = 2.5 // Fator de facilidade máximo
  const maxRepetitions = 10 // Número máximo de repetições para considerar

  // Calcula o peso de cada fator
  const intervalWeight = Math.min(card.interval / maxInterval, 1) * 0.4 // 40% do peso
  const easeFactorWeight = (card.easeFactor / maxEaseFactor) * 0.3 // 30% do peso
  const repetitionsWeight = Math.min(card.repetitions / maxRepetitions, 1) * 0.3 // 30% do peso

  // Calcula o domínio total (0-100)
  return Math.round((intervalWeight + easeFactorWeight + repetitionsWeight) * 100)
}

// Função auxiliar para calcular o nível de domínio do deck
const calculateDeckMastery = (cards: Card[]): number => {
  if (cards.length === 0) return 0

  // Calcula a média do domínio de todos os cards
  const totalMastery = cards.reduce((sum, card) => sum + calculateCardMastery(card), 0)
  return Math.round(totalMastery / cards.length)
}

export const useFlashcardsStore = create<FlashcardsState>()(
  persist(
    (set, get) => ({
      decks: [],

      addDeck: (newDeck) => {
        const id = Date.now().toString()
        const now = new Date().toISOString()
        
        // Inicializa os cards com valores padrão de revisão espaçada
        const cards = newDeck.cards.map(card => ({
          ...card,
          interval: 0,
          easeFactor: 2.5,
          nextReview: now,
          repetitions: 0
        }))

        set((state) => ({
          decks: [
            ...state.decks,
            {
              ...newDeck,
              id,
              cards,
              totalCards: cards.length,
              lastStudied: now,
              masteryLevel: 0,
              wrongCards: []
            }
          ]
        }))
        return id
      },

      updateDeck: (deckId, updatedDeck) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  ...updatedDeck,
                  totalCards: updatedDeck.cards?.length ?? deck.totalCards,
                  wrongCards: deck.wrongCards || []
                }
              : deck
          )
        })),

      deleteDeck: (deckId) =>
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== deckId)
        })),

      getDeck: (deckId) => {
        const state = get()
        const deck = state.decks.find((deck) => deck.id === deckId)
        if (deck) {
          return {
            ...deck,
            wrongCards: deck.wrongCards || []
          }
        }
        return undefined
      },

      updateStudyProgress: (deckId, correct, total, wrongCards) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  lastStudied: new Date().toISOString(),
                  masteryLevel: calculateDeckMastery(deck.cards),
                  wrongCards: wrongCards || []
                }
              : deck
          )
        })),

      updateCardProgress: (deckId, cardId, quality) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) =>
                    card.id === cardId
                      ? { ...card, ...calculateNextReview(card, quality) }
                      : card
                  ),
                  masteryLevel: calculateDeckMastery(deck.cards)
                }
              : deck
          )
        })),

      getDueCards: (deckId) => {
        const state = get()
        const deck = state.decks.find((d) => d.id === deckId)
        if (!deck) return []

        const now = new Date()
        return deck.cards.filter((card) => {
          const nextReview = new Date(card.nextReview)
          return nextReview <= now
        })
      }
    }),
    {
      name: 'flashcards-storage'
    }
  )
) 