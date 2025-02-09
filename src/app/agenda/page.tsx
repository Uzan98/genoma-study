'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Clock, Target, Book, Search, Edit, Trash2, Check } from 'lucide-react'
import Link from 'next/link'
import { useAgendaStore, type Evento } from '@/store/useAgendaStore'

export default function AgendaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { eventos, deletarEvento } = useAgendaStore()

  const eventosFiltrados = eventos.filter(evento =>
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.materia.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Ordenar eventos por data e horário
  const eventosFiltradosOrdenados = [...eventosFiltrados].sort((a, b) => {
    const dataA = new Date(`${a.data}T${a.horario}`)
    const dataB = new Date(`${b.data}T${b.horario}`)
    return dataA.getTime() - dataB.getTime()
  })

  const handleDeletarEvento = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      deletarEvento(id)
    }
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
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Minha Agenda
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Organize seus estudos e compromissos
            </p>
          </div>
          <Link href="/agenda/novo">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-5 h-5" />
              Novo Evento
            </motion.button>
          </Link>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar eventos..."
              className="w-full px-4 py-3 pl-12 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventosFiltradosOrdenados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                Você ainda não tem nenhum evento agendado
              </p>
              <Link href="/agenda/novo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Criar Meu Primeiro Evento
                </motion.button>
              </Link>
            </div>
          ) : (
            eventosFiltradosOrdenados.map((evento) => (
              <motion.div
                key={evento.id}
                whileHover={{ scale: 1.02, translateY: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {evento.tipo === 'estudo' && (
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    {evento.tipo === 'simulado' && (
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    {evento.tipo === 'flashcards' && (
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Book className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {evento.titulo}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {evento.materia}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/agenda/${evento.id}/editar`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeletarEvento(evento.id)}
                      className="text-red-500 hover:text-red-600 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {evento.descricao}
                </p>

                {/* Lista de Tarefas */}
                {evento.tarefas.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tarefas ({evento.tarefas.filter(t => t.concluida).length}/{evento.tarefas.length})
                    </div>
                    {evento.tarefas.map((tarefa) => (
                      <div
                        key={tarefa.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            tarefa.concluida
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {tarefa.concluida && <Check className="w-3 h-3" />}
                        </div>
                        <span
                          className={`flex-1 text-gray-700 dark:text-gray-300 ${
                            tarefa.concluida ? 'line-through text-gray-400 dark:text-gray-500' : ''
                          }`}
                        >
                          {tarefa.texto}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(evento.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{evento.horario}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  )
} 