'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Check, X, Award, ChartBar, Target, Brain } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSimuladosStore, type Questao } from '@/store/useSimuladosStore'
import { use } from 'react'

interface SimuladoStats {
  acertos: number
  erros: number
  tempoGasto: number
  respostas: { questaoId: string; correta: boolean }[]
}

interface IniciarSimuladoPageProps {
  params: Promise<{ id: string }>
}

export default function IniciarSimuladoPage({ params }: IniciarSimuladoPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { getSimulado, updateSimuladoProgress } = useSimuladosStore()
  const simulado = getSimulado(id)

  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [respostas, setRespostas] = useState<{ [key: string]: number }>({})
  const [timer, setTimer] = useState(0)
  const [showResultado, setShowResultado] = useState(false)
  const [stats, setStats] = useState<SimuladoStats>({
    acertos: 0,
    erros: 0,
    tempoGasto: 0,
    respostas: []
  })
  const [alternativasEliminadas, setAlternativasEliminadas] = useState<{ [key: string]: boolean[] }>({})
  const [showConfirmacao, setShowConfirmacao] = useState(false)

  useEffect(() => {
    if (!simulado) {
      router.push('/simulados')
      return
    }
  }, [simulado, router])

  // Efeito para resetar o estado quando a página é carregada
  useEffect(() => {
    setQuestaoAtual(0)
    setRespostas({})
    setTimer(0)
    setShowResultado(false)
    setStats({
      acertos: 0,
      erros: 0,
      tempoGasto: 0,
      respostas: []
    })
    setAlternativasEliminadas({})
    setShowConfirmacao(false)
  }, [id]) // Dependência no id para resetar quando mudar de simulado ou recarregar

  // Timer
  useEffect(() => {
    if (!showResultado) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showResultado])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleResposta = (alternativaIndex: number) => {
    if (!simulado) return

    // Não permite selecionar alternativa eliminada
    const estaEliminada = (alternativasEliminadas[simulado.questoes[questaoAtual].id] || [])[alternativaIndex]
    if (estaEliminada) return

    setRespostas(prev => ({
      ...prev,
      [simulado.questoes[questaoAtual].id]: alternativaIndex
    }))
  }

  const handleProximaQuestao = () => {
    if (!simulado) return

    if (questaoAtual < simulado.questoes.length - 1) {
      setQuestaoAtual(prev => prev + 1)
    } else {
      // Verifica se há questões em branco
      const questoesEmBranco = simulado.questoes.filter(q => respostas[q.id] === undefined).length
      if (questoesEmBranco > 0) {
        setShowConfirmacao(true)
    } else {
      finalizarSimulado()
      }
    }
  }

  const handleQuestaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(prev => prev - 1)
    }
  }

  const handleReiniciarSimulado = () => {
    setQuestaoAtual(0)
    setRespostas({})
    setTimer(0)
    setShowResultado(false)
    setStats({
      acertos: 0,
      erros: 0,
      tempoGasto: 0,
      respostas: []
    })
    setAlternativasEliminadas({})
    setShowConfirmacao(false)
  }

  const handleEliminarAlternativa = (alternativaIndex: number) => {
    if (!simulado) return

    const questaoId = simulado.questoes[questaoAtual].id
    const eliminadasDaQuestao = alternativasEliminadas[questaoId] || Array(5).fill(false)

    setAlternativasEliminadas(prev => ({
      ...prev,
      [questaoId]: eliminadasDaQuestao.map((eliminada, i) => 
        i === alternativaIndex ? !eliminada : eliminada
      )
    }))
  }

  const finalizarSimulado = () => {
    if (!simulado) return

    let acertos = 0
    const respostasDetalhadas: { questaoId: string; correta: boolean }[] = []

    simulado.questoes.forEach(questao => {
      const respostaUsuario = respostas[questao.id]
      const estaCorreta = questao.alternativas[respostaUsuario]?.correta || false
      
      if (estaCorreta) acertos++
      
      respostasDetalhadas.push({
        questaoId: questao.id,
        correta: estaCorreta
      })
    })

    const novasStats: SimuladoStats = {
      acertos,
      erros: simulado.questoes.length - acertos,
      tempoGasto: timer,
      respostas: respostasDetalhadas
    }

    setStats(novasStats)
    setShowResultado(true)

    // Atualizar progresso no store
    updateSimuladoProgress(
      simulado.id,
      acertos,
      formatTime(timer)
    )
  }

  if (!simulado) return null

  const questaoAtualObj = simulado.questoes[questaoAtual]
  const respostaAtual = respostas[questaoAtualObj.id]
  const totalQuestoes = simulado.questoes.length
  const questoesRespondidas = Object.keys(respostas).length

  return (
    <main className="container mx-auto px-4 py-8 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <AnimatePresence mode="wait">
        {showConfirmacao && (
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Questões em Branco
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Você ainda tem questões não respondidas. Deseja finalizar o simulado mesmo assim?
                As questões em branco serão consideradas como erradas.
              </p>
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmacao(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Continuar Respondendo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowConfirmacao(false)
                    finalizarSimulado()
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  Finalizar Mesmo Assim
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {!showResultado ? (
          <motion.div
            key="simulado"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto flex gap-8"
          >
            {/* Navegador Lateral */}
            <div className="hidden lg:flex flex-col gap-4 min-w-[180px]">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100/50 dark:border-purple-900/50 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">
                  Questões
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {simulado.questoes.map((q, index) => {
                    const foiRespondida = respostas[q.id] !== undefined
                    const ehAtual = index === questaoAtual
                    
                    return (
                      <motion.button
                        key={q.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuestaoAtual(index)}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200
                          ${ehAtual ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                          ${foiRespondida 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-sm' 
                            : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-gray-600/50'
                          }
                        `}
                      >
                        {index + 1}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100/50 dark:border-purple-900/50 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">{formatTime(timer)}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="mb-2">Progresso</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${(questoesRespondidas / totalQuestoes) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {Math.round((questoesRespondidas / totalQuestoes) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1">
              {/* Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-between items-center mb-8"
              >
                <Link href="/simulados">
                  <motion.button
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </motion.button>
                </Link>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Questão {questaoAtual + 1} de {totalQuestoes}
                </div>
              </motion.div>

              {/* Questão */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-8 border border-purple-100/50 dark:border-purple-900/50 hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-xl text-gray-800 dark:text-white mb-8 leading-relaxed font-medium">
                  {questaoAtualObj.enunciado}
                </h2>

                {/* Alternativas */}
                <div className="space-y-4">
                  {questaoAtualObj.alternativas.map((alternativa, index) => {
                    const estaEliminada = (alternativasEliminadas[questaoAtualObj.id] || [])[index]
                    
                    return (
                      <motion.div 
                        key={alternativa.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <motion.button
                          whileHover={!estaEliminada ? { scale: 1.01 } : {}}
                          whileTap={!estaEliminada ? { scale: 0.99 } : {}}
                          onClick={() => handleResposta(index)}
                          className={`flex-1 p-4 rounded-xl text-left transition-all duration-200 ${
                            respostaAtual === index
                              ? 'bg-purple-100/80 dark:bg-purple-900/30 border-2 border-purple-500 shadow-lg'
                              : estaEliminada
                                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
                                : 'bg-white/80 dark:bg-gray-700/50 hover:bg-purple-50/80 dark:hover:bg-purple-900/20 border border-purple-100/50 dark:border-purple-900/50 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`min-w-[2rem] h-8 rounded-xl flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                              respostaAtual === index
                                ? 'bg-purple-500 text-white'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className={`text-gray-800 dark:text-white flex-1 ${
                              estaEliminada ? 'line-through text-gray-400 dark:text-gray-500' : ''
                            }`}>
                              {alternativa.texto}
                            </span>
                          </div>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEliminarAlternativa(index)}
                          className={`p-2 rounded-lg transition-colors shrink-0 ${
                            estaEliminada
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                              : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Navegação */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-between items-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuestaoAnterior}
                  disabled={questaoAtual === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                    ${questaoAtual === 0
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm hover:shadow-md border border-purple-100/50 dark:border-purple-900/50'
                    }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Anterior
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleProximaQuestao}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                >
                  {questaoAtual === simulado.questoes.length - 1 ? (
                    <>Finalizar<Check className="w-5 h-5" /></>
                  ) : (
                    <>Próxima<ArrowRight className="w-5 h-5" /></>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="resultado"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-between items-center mb-8"
            >
              <Link href="/simulados">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </motion.button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Resultado do Simulado
              </h1>
              <div className="w-6" />
            </motion.div>

            {/* Cards de Estatísticas */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Acertos */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100 dark:border-green-900/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Target className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Acertos
                    </h3>
                    <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                      {stats.acertos} / {totalQuestoes}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((stats.acertos / totalQuestoes) * 100)}% de aproveitamento
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Erros */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100 dark:border-red-900/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Erros
                    </h3>
                    <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                      {stats.erros} / {totalQuestoes}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((stats.erros / totalQuestoes) * 100)}% de questões incorretas
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Tempo */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-blue-900/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tempo Total
                    </h3>
                    <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                      {formatTime(stats.tempoGasto)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(stats.tempoGasto / totalQuestoes)} segundos por questão
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Desempenho */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-900/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Award className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Desempenho
                    </h3>
                    <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                      {['Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente'][Math.floor((stats.acertos / totalQuestoes) * 5)]}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Baseado na taxa de acertos
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Revisão das Questões */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-500" />
                Revisão das Questões
              </h2>

              <div className="space-y-8">
                {simulado.questoes.map((questao, index) => {
                  const respostaUsuario = respostas[questao.id]
                  const alternativaCorreta = questao.alternativas.findIndex(alt => alt.correta)
                  const estaCorreta = questao.alternativas[respostaUsuario]?.correta || false

                  return (
                    <motion.div
                      key={questao.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className={`p-6 rounded-xl border ${
                        estaCorreta
                          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                          : 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-2 rounded-xl flex items-center justify-center ${
                          estaCorreta
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-500'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                        }`}>
                          {estaCorreta ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center justify-between">
                            <span>Questão {index + 1}</span>
                            <span className={`text-sm ${
                              estaCorreta
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}>
                              {estaCorreta ? 'Correta' : 'Incorreta'}
                            </span>
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                            {questao.enunciado}
                          </p>

                          <div className="space-y-3">
                            {questao.alternativas.map((alternativa, altIndex) => (
                              <div
                                key={alternativa.id}
                                className={`p-3 rounded-lg flex items-start gap-3 ${
                                  respostaUsuario === altIndex
                                    ? alternativa.correta
                                      ? 'bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30'
                                      : 'bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30'
                                    : alternativa.correta
                                      ? 'bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30'
                                      : 'bg-gray-50 dark:bg-gray-700/30'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm ${
                                  respostaUsuario === altIndex
                                    ? alternativa.correta
                                      ? 'bg-green-500 text-white'
                                      : 'bg-red-500 text-white'
                                    : alternativa.correta
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}>
                                  {String.fromCharCode(65 + altIndex)}
                                </div>
                                <span className={`flex-1 text-sm ${
                                  respostaUsuario === altIndex
                                    ? alternativa.correta
                                      ? 'text-green-700 dark:text-green-300'
                                      : 'text-red-700 dark:text-red-300'
                                    : alternativa.correta
                                      ? 'text-green-700 dark:text-green-300'
                                      : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                  {alternativa.texto}
                                </span>
                                {((respostaUsuario === altIndex) || alternativa.correta) && (
                                  <div className={`p-1 rounded-lg ${
                                    alternativa.correta
                                      ? 'text-green-500'
                                      : 'text-red-500'
                                  }`}>
                                    {alternativa.correta ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {questao.explicacao && (
                            <div className="mt-4 p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                              <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                                Explicação
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {questao.explicacao}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Botões de Ação */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end gap-4 mt-8"
            >
              <Link href="/simulados">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Voltar aos Simulados
                </motion.button>
              </Link>
              <motion.button
                onClick={handleReiniciarSimulado}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-medium bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 transition-all"
              >
                Refazer Simulado
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
} 