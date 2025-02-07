import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Alternativa {
  id: string
  texto: string
  correta: boolean
}

export interface Questao {
  id: string
  enunciado: string
  alternativas: Alternativa[]
  explicacao?: string
  materia?: string
  assunto?: string
}

export interface Simulado {
  id: string
  titulo: string
  descricao: string
  questoes: Questao[]
  tempoMedio?: string
  tentativas: number
  melhorNota?: string
  acertos?: number
  ultimaTentativa?: string
}

interface SimuladosState {
  simulados: Simulado[]
  addSimulado: (simulado: Omit<Simulado, 'id' | 'tentativas'>) => string
  updateSimulado: (id: string, simulado: Partial<Simulado>) => void
  deleteSimulado: (id: string) => void
  getSimulado: (id: string) => Simulado | undefined
  updateSimuladoProgress: (id: string, acertos: number, tempo: string) => void
}

export const useSimuladosStore = create<SimuladosState>()(
  persist(
    (set, get) => ({
      simulados: [],

      addSimulado: (newSimulado) => {
        const id = Date.now().toString()
        set((state) => ({
          simulados: [
            ...state.simulados,
            {
              ...newSimulado,
              id,
              tentativas: 0,
              acertos: 0,
              melhorNota: '0%',
              ultimaTentativa: new Date().toISOString()
            }
          ]
        }))
        return id
      },

      updateSimulado: (id, updatedSimulado) =>
        set((state) => ({
          simulados: state.simulados.map((simulado) =>
            simulado.id === id
              ? { ...simulado, ...updatedSimulado }
              : simulado
          )
        })),

      deleteSimulado: (id) =>
        set((state) => ({
          simulados: state.simulados.filter((simulado) => simulado.id !== id)
        })),

      getSimulado: (id) => {
        const state = get()
        return state.simulados.find((simulado) => simulado.id === id)
      },

      updateSimuladoProgress: (id, acertos, tempo) =>
        set((state) => {
          const simulado = state.simulados.find((s) => s.id === id)
          if (!simulado) return state

          const percentualAcertos = Math.round((acertos / simulado.questoes.length) * 100)
          const melhorNotaAtual = parseInt(simulado.melhorNota || '0')
          
          return {
            simulados: state.simulados.map((s) =>
              s.id === id
                ? {
                    ...s,
                    tentativas: s.tentativas + 1,
                    acertos: percentualAcertos,
                    melhorNota: `${Math.max(percentualAcertos, melhorNotaAtual)}%`,
                    tempoMedio: tempo,
                    ultimaTentativa: new Date().toISOString()
                  }
                : s
            )
          }
        })
    }),
    {
      name: 'simulados-storage'
    }
  )
) 