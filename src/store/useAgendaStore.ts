import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Tarefa {
  id: string
  texto: string
  concluida: boolean
}

export interface Evento {
  id: number
  titulo: string
  data: string
  horario: string
  tipo: 'estudo' | 'simulado' | 'flashcards'
  materia: string
  descricao: string
  tarefas: Tarefa[]
}

interface AgendaStore {
  eventos: Evento[]
  adicionarEvento: (evento: Omit<Evento, 'id'>) => number
  editarEvento: (id: number, evento: Partial<Evento>) => void
  deletarEvento: (id: number) => void
  getEvento: (id: number) => Evento | undefined
  adicionarTarefa: (eventoId: number, texto: string) => void
  removerTarefa: (eventoId: number, tarefaId: string) => void
  toggleTarefa: (eventoId: number, tarefaId: string) => void
}

export const useAgendaStore = create<AgendaStore>()(
  persist(
    (set, get) => ({
      eventos: [],
      
      adicionarEvento: (evento) => {
        const id = Math.max(0, ...get().eventos.map(e => e.id)) + 1
        set((state) => ({
          eventos: [...state.eventos, { ...evento, id, tarefas: [] }]
        }))
        return id
      },

      editarEvento: (id, evento) => {
        set((state) => ({
          eventos: state.eventos.map((e) =>
            e.id === id ? { ...e, ...evento } : e
          )
        }))
      },

      deletarEvento: (id) => {
        set((state) => ({
          eventos: state.eventos.filter((e) => e.id !== id)
        }))
      },

      getEvento: (id) => {
        return get().eventos.find((e) => e.id === id)
      },

      adicionarTarefa: (eventoId, texto) => {
        set((state) => ({
          eventos: state.eventos.map((evento) =>
            evento.id === eventoId
              ? {
                  ...evento,
                  tarefas: [
                    ...evento.tarefas,
                    {
                      id: Date.now().toString(),
                      texto,
                      concluida: false
                    }
                  ]
                }
              : evento
          )
        }))
      },

      removerTarefa: (eventoId, tarefaId) => {
        set((state) => ({
          eventos: state.eventos.map((evento) =>
            evento.id === eventoId
              ? {
                  ...evento,
                  tarefas: evento.tarefas.filter((t) => t.id !== tarefaId)
                }
              : evento
          )
        }))
      },

      toggleTarefa: (eventoId, tarefaId) => {
        set((state) => ({
          eventos: state.eventos.map((evento) =>
            evento.id === eventoId
              ? {
                  ...evento,
                  tarefas: evento.tarefas.map((tarefa) =>
                    tarefa.id === tarefaId
                      ? { ...tarefa, concluida: !tarefa.concluida }
                      : tarefa
                  )
                }
              : evento
          )
        }))
      }
    }),
    {
      name: 'agenda-storage'
    }
  )
) 