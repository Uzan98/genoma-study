'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSimuladosStore, type Questao, type Alternativa } from '@/store/useSimuladosStore'
import { use } from 'react'

interface EditarSimuladoPageProps {
  params: Promise<{ id: string }>
}

export default function EditarSimuladoPage({ params }: EditarSimuladoPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { getSimulado, updateSimulado } = useSimuladosStore()
  const simuladoExistente = getSimulado(id)

  const [titulo, setTitulo] = useState(simuladoExistente?.titulo || '')
  const [descricao, setDescricao] = useState(simuladoExistente?.descricao || '')
  const [questoes, setQuestoes] = useState<Omit<Questao, 'id'>[]>(
    simuladoExistente?.questoes.map(q => ({
      enunciado: q.enunciado,
      alternativas: q.alternativas,
      explicacao: q.explicacao || '',
      materia: q.materia,
      assunto: q.assunto,
    })) || []
  )

  useEffect(() => {
    if (!simuladoExistente) {
      router.push('/simulados')
    }
  }, [simuladoExistente, router])

  const handleAddQuestao = () => {
    setQuestoes([
      ...questoes,
      {
        enunciado: '',
        alternativas: [
          { id: Date.now().toString() + '1', texto: '', correta: true },
          { id: Date.now().toString() + '2', texto: '', correta: false },
          { id: Date.now().toString() + '3', texto: '', correta: false },
          { id: Date.now().toString() + '4', texto: '', correta: false },
        ],
        explicacao: '',
        materia: '',
        assunto: '',
      }
    ])
  }

  const handleRemoveQuestao = (index: number) => {
    setQuestoes(questoes.filter((_, i) => i !== index))
  }

  const handleUpdateQuestao = (index: number, field: keyof Questao, value: string) => {
    setQuestoes(questoes.map((questao, i) => {
      if (i === index) {
        return { ...questao, [field]: value }
      }
      return questao
    }))
  }

  const handleUpdateAlternativa = (questaoIndex: number, alternativaIndex: number, field: keyof Alternativa, value: string | boolean) => {
    setQuestoes(questoes.map((questao, i) => {
      if (i === questaoIndex) {
        const novasAlternativas = questao.alternativas.map((alt, j) => {
          if (j === alternativaIndex) {
            if (field === 'correta' && value === true) {
              // Se esta alternativa está sendo marcada como correta, as outras devem ser marcadas como incorretas
              return { ...alt, correta: true }
            }
            return { ...alt, [field]: value }
          }
          if (field === 'correta' && value === true) {
            // Marca todas as outras alternativas como incorretas
            return { ...alt, correta: false }
          }
          return alt
        })
        return { ...questao, alternativas: novasAlternativas }
      }
      return questao
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!titulo.trim()) {
      alert('Por favor, insira um título para o simulado')
      return
    }

    if (!descricao.trim()) {
      alert('Por favor, insira uma descrição para o simulado')
      return
    }

    // Validar questões
    for (let i = 0; i < questoes.length; i++) {
      const questao = questoes[i]
      if (!questao.enunciado.trim()) {
        alert(`Por favor, insira o enunciado da questão ${i + 1}`)
        return
      }
      
      // Validar alternativas
      const temAlternativaCorreta = questao.alternativas.some(alt => alt.correta)
      if (!temAlternativaCorreta) {
        alert(`Por favor, marque a alternativa correta da questão ${i + 1}`)
        return
      }
      
      // Verifica se tem pelo menos 4 alternativas preenchidas
      const alternativasPreenchidas = questao.alternativas.filter(alt => alt.texto.trim()).length
      if (alternativasPreenchidas < 4) {
        alert(`Por favor, preencha pelo menos 4 alternativas da questão ${i + 1}`)
        return
      }
    }

    // Adicionar IDs às questões
    const questoesComId = questoes.map(questao => ({
      ...questao,
      id: Math.random().toString(36).substr(2, 9)
    }))

    // Atualizar simulado
    updateSimulado(id, {
      titulo,
      descricao,
      questoes: questoesComId,
    })

    // Redirecionar para a lista de simulados
    router.push('/simulados')
  }

  if (!simuladoExistente) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-[40rem] h-[40rem] bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-[35rem] h-[35rem] bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_500px_at_50%_50%,rgba(120,119,198,0.05),transparent)]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/simulados">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Editar Simulado
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Informações Básicas
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Simulado de Anatomia - Sistema Digestório"
                  />
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Descreva o conteúdo e objetivos deste simulado"
                  />
                </div>
              </div>
            </div>

            {/* Questões */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Questões
              </h2>

              {questoes.map((questao, questaoIndex) => (
                <div
                  key={questaoIndex}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                      Questão {questaoIndex + 1}
                    </h3>
                    {questoes.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => handleRemoveQuestao(questaoIndex)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-red-500 hover:text-red-600 p-2 rounded-lg"
                      >
                        <Minus className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>

                  {/* Enunciado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Enunciado
                    </label>
                    <textarea
                      value={questao.enunciado}
                      onChange={(e) => handleUpdateQuestao(questaoIndex, 'enunciado', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite o enunciado da questão"
                    />
                  </div>

                  {/* Alternativas */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Alternativas
                    </label>
                    {questao.alternativas.map((alternativa, altIndex) => (
                      <div key={alternativa.id} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correta-${questaoIndex}`}
                          checked={alternativa.correta}
                          onChange={() => handleUpdateAlternativa(questaoIndex, altIndex, 'correta', true)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <input
                          type="text"
                          value={alternativa.texto}
                          onChange={(e) => handleUpdateAlternativa(questaoIndex, altIndex, 'texto', e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={`Alternativa ${altIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explicação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Explicação
                    </label>
                    <textarea
                      value={questao.explicacao}
                      onChange={(e) => handleUpdateQuestao(questaoIndex, 'explicacao', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Explique a resposta correta (opcional)"
                    />
                  </div>

                  {/* Matéria e Assunto (Opcionais) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Matéria (Opcional)
                      </label>
                      <input
                        type="text"
                        value={questao.materia}
                        onChange={(e) => handleUpdateQuestao(questaoIndex, 'materia', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: Anatomia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assunto (Opcional)
                      </label>
                      <input
                        type="text"
                        value={questao.assunto}
                        onChange={(e) => handleUpdateQuestao(questaoIndex, 'assunto', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: Sistema Digestório"
                      />
                    </div>
                  </div>

                  {/* Botão para adicionar 5ª alternativa */}
                  {questao.alternativas.length < 5 && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        const novasAlternativas = [...questao.alternativas, {
                          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                          texto: '',
                          correta: false
                        }]
                        setQuestoes(questoes.map((q, i) => 
                          i === questaoIndex ? { ...q, alternativas: novasAlternativas } : q
                        ))
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar 5ª Alternativa
                    </motion.button>
                  )}
                </div>
              ))}

              {/* Botão Adicionar Questão (Movido para o final) */}
              <motion.button
                type="button"
                onClick={handleAddQuestao}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 justify-center font-medium"
              >
                <Plus className="w-5 h-5" />
                Adicionar Nova Questão
              </motion.button>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 