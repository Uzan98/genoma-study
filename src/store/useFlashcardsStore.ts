import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Card {
  id: string
  front: string
  back: string
  totalEstudos: number // Total de vezes que o card foi estudado
  acertos: number // Total de acertos
  erros: number // Total de erros
  ultimoEstudo: string | null // Data do último estudo
}

export interface Deck {
  id: string
  titulo: string
  descricao: string
  cards: Card[]
}

interface FlashcardsState {
  decks: Deck[]
  adicionarDeck: (deck: Omit<Deck, 'id'>) => string
  atualizarDeck: (deckId: string, deck: Partial<Deck>) => void
  deletarDeck: (deckId: string) => void
  getDeck: (deckId: string) => Deck | undefined
  atualizarProgresso: (deckId: string, cardId: string, acertou: boolean) => void
}

export const useFlashcardsStore = create<FlashcardsState>()(
  persist(
    (set, get) => ({
      decks: [],

      adicionarDeck: (novoDeck) => {
        const id = Date.now().toString()
        
        // Inicializa os cards com valores padrão
        const cards = novoDeck.cards.map(card => ({
          ...card,
          totalEstudos: 0,
          acertos: 0,
          erros: 0,
          ultimoEstudo: null
        }))

        set((state) => ({
          decks: [
            ...state.decks,
            {
              ...novoDeck,
              id,
              cards
            }
          ]
        }))
        return id
      },

      atualizarDeck: (deckId, deckAtualizado) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  ...deckAtualizado
                }
              : deck
          )
        })),

      deletarDeck: (deckId) =>
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== deckId)
        })),

      getDeck: (deckId) => {
        const state = get()
        return state.decks.find((deck) => deck.id === deckId)
      },

      atualizarProgresso: (deckId, cardId, acertou) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) =>
                    card.id === cardId
                      ? {
                          ...card,
                          totalEstudos: card.totalEstudos + 1,
                          acertos: card.acertos + (acertou ? 1 : 0),
                          erros: card.erros + (acertou ? 0 : 1),
                          ultimoEstudo: new Date().toISOString()
                        }
                      : card
                  )
                }
              : deck
          )
        }))
    }),
    {
      name: 'flashcards-storage'
    }
  )
) 