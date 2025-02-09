'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAgendaStore, type Evento } from '@/store/useAgendaStore'

export default function NovoEventoPage() {
  const router = useRouter()
  const { adicionarEvento } = useAgendaStore()
  const [novaTarefa, setNovaTarefa] = useState('')
  const [tarefasTemp, setTarefasTemp] = useState<{ id: string; texto: string; concluida: boolean }[]>([])

  const [evento, setEvento] = useState<Omit<Evento, 'id'>>({
    titulo: '',
    data: '',
    horario: '',
    tipo: 'estudo',
    materia: '',
    descricao: '',
    tarefas: []
  })

  const adicionarTarefaTemp = (texto: string) => {
    if (texto.trim()) {
      const novaTarefa = {
        id: Date.now().toString(),
        texto: texto.trim(),
        concluida: false
      }
      setTarefasTemp([...tarefasTemp, novaTarefa])
      setEvento({
        ...evento,
        tarefas: [...evento.tarefas, novaTarefa]
      })
    }
  }

  const removerTarefaTemp = (id: string) => {
    setTarefasTemp(tarefasTemp.filter(t => t.id !== id))
    setEvento({
      ...evento,
      tarefas: evento.tarefas.filter(t => t.id !== id)
    })
  }

  const toggleTarefaTemp = (id: string) => {
    setTarefasTemp(tarefasTemp.map(t =>
      t.id === id ? { ...t, concluida: !t.concluida } : t
    ))
    setEvento({
      ...evento,
      tarefas: evento.tarefas.map(t =>
        t.id === id ? { ...t, concluida: !t.concluida } : t
      )
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!evento.titulo.trim()) {
      alert('Por favor, insira um título para o evento')
      return
    }

    if (!evento.data) {
      alert('Por favor, selecione uma data para o evento')
      return
    }

    if (!evento.horario) {
      alert('Por favor, selecione um horário para o evento')
      return
    }

    // Adicionar evento
    adicionarEvento(evento)

    // Redirecionar para a lista de eventos
    router.push('/agenda')
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/agenda">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Novo Evento
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              {/* Título */}
              <div className="mb-4">
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={evento.titulo}
                  onChange={(e) => setEvento({ ...evento, titulo: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Revisão de Anatomia"
                />
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    id="data"
                    value={evento.data}
                    onChange={(e) => setEvento({ ...evento, data: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="horario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    id="horario"
                    value={evento.horario}
                    onChange={(e) => setEvento({ ...evento, horario: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo e Matéria */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    value={evento.tipo}
                    onChange={(e) => setEvento({ ...evento, tipo: e.target.value as Evento['tipo'] })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="estudo">Estudo</option>
                    <option value="simulado">Simulado</option>
                    <option value="flashcards">Flashcards</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="materia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Matéria
                  </label>
                  <input
                    type="text"
                    id="materia"
                    value={evento.materia}
                    onChange={(e) => setEvento({ ...evento, materia: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Anatomia"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  value={evento.descricao}
                  onChange={(e) => setEvento({ ...evento, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva os detalhes do evento"
                />
              </div>

              {/* Lista de Tarefas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Lista de Tarefas
                </label>

                {/* Adicionar Nova Tarefa */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={novaTarefa}
                    onChange={(e) => setNovaTarefa(e.target.value)}
                    placeholder="Adicionar nova tarefa..."
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && novaTarefa.trim()) {
                        adicionarTarefaTemp(novaTarefa)
                        setNovaTarefa('')
                      }
                    }}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (novaTarefa.trim()) {
                        adicionarTarefaTemp(novaTarefa)
                        setNovaTarefa('')
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </motion.button>
                </div>

                {/* Lista de Tarefas */}
                <div className="space-y-2">
                  {tarefasTemp.map((tarefa) => (
                    <div
                      key={tarefa.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleTarefaTemp(tarefa.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          tarefa.concluida
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {tarefa.concluida && <Check className="w-3 h-3" />}
                      </motion.button>
                      <span
                        className={`flex-1 text-gray-700 dark:text-gray-300 ${
                          tarefa.concluida ? 'line-through text-gray-400 dark:text-gray-500' : ''
                        }`}
                      >
                        {tarefa.texto}
                      </span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removerTarefaTemp(tarefa.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Save className="w-5 h-5" />
                Salvar Evento
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 