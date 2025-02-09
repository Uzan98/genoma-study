'use client'

import { motion } from 'framer-motion'
import { Plus, FlaskConical, Clock, ChartBar, Edit, Trash2, Target, Award, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useSimuladosStore, type Simulado } from '@/store/useSimuladosStore'

export default function SimuladosPage() {
  const { simulados, deleteSimulado } = useSimuladosStore()

  // Cálculo das estatísticas gerais
  const totalSimulados = simulados.length
  
  // Média de acertos (considerando apenas simulados que foram feitos)
  const simuladosFeitos = simulados.filter((simulado: Simulado) => simulado.tentativas > 0)
  const mediaAcertos = simuladosFeitos.length > 0
    ? Math.round(simuladosFeitos.reduce((sum: number, simulado: Simulado) => sum + (simulado.acertos || 0), 0) / simuladosFeitos.length)
    : 0

  // Melhor desempenho
  const melhorDesempenho = simulados.length > 0
    ? Math.max(...simulados.map((simulado: Simulado) => parseInt(simulado.melhorNota || '0')))
    : 0

  // Tempo médio (convertendo string "MM:SS" para segundos, calculando média e convertendo de volta)
  const tempoMedio = simuladosFeitos.length > 0
    ? (() => {
        const tempoTotalSegundos = simuladosFeitos.reduce((sum: number, simulado: Simulado) => {
          if (!simulado.tempoMedio) return sum
          const [minutos, segundos] = simulado.tempoMedio.split(':').map(Number)
          return sum + (minutos * 60 + segundos)
        }, 0)
        
        const mediaSegundos = Math.round(tempoTotalSegundos / simuladosFeitos.length)
        const minutos = Math.floor(mediaSegundos / 60)
        const segundos = mediaSegundos % 60
        return `${minutos}:${segundos.toString().padStart(2, '0')}`
      })()
    : '--:--'

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-[40rem] h-[40rem] bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-[35rem] h-[35rem] bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_500px_at_50%_50%,rgba(120,119,198,0.05),transparent)]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Meus Simulados
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Pratique com questões e acompanhe seu desempenho
            </p>
          </div>
          <Link href="/simulados/novo">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Simulado
            </motion.button>
          </Link>
        </div>

        {/* Painel de Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg">
                <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Simulados</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{totalSimulados}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Média de Acertos</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{mediaAcertos}%</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Melhor Desempenho</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{melhorDesempenho}%</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio</p>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{tempoMedio}</h3>
              </div>
            </div>
          </div>
        </motion.div>

        {simulados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Você ainda não tem nenhum simulado
            </p>
            <Link href="/simulados/novo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Criar Meu Primeiro Simulado
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {simulados.map((simulado: Simulado) => (
              <motion.div
                key={simulado.id}
                whileHover={{ scale: 1.03, translateY: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl"
              >
                {/* Cabeçalho do Card com Gradiente */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                        {simulado.titulo}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <FlaskConical className="w-4 h-4" />
                        <span>{simulado.questoes?.length || 0} questões</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <ChartBar className="w-4 h-4" />
                        <span>{simulado.acertos || 0}% acertos</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/simulados/${simulado.id}/editar`}>
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
                        onClick={() => deleteSimulado(simulado.id)}
                        className="text-red-500 hover:text-red-600 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                {/* Corpo do Card */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 min-h-[40px]">
                    {simulado.descricao}
                  </p>

                  {/* Estatísticas do Simulado */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Tempo Médio */}
                    <div className="col-span-1">
                      <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Tempo médio</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                          {simulado.tempoMedio || '45 min'}
                        </span>
                      </div>
                    </div>

                    {/* Tentativas */}
                    <div className="col-span-1">
                      <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Tentativas</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 text-center">
                          {simulado.tentativas || 0}
                        </span>
                      </div>
                    </div>

                    {/* Melhor Nota */}
                    <div className="col-span-1">
                      <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <Award className="w-5 h-5 text-green-500 dark:text-green-400 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Melhor nota</span>
                        <span className="text-sm font-medium text-green-500 dark:text-green-400 text-center">
                          {simulado.melhorNota || '0%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Iniciar */}
                  <Link href={`/simulados/${simulado.id}/iniciar`} className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg font-medium shadow-sm"
                    >
                      Iniciar Simulado
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 