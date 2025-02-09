'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowLeft, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSimuladosStore, type Questao, type Alternativa } from '@/store/useSimuladosStore'

const NovoSimuladoPage: React.FC = () => {
  const router = useRouter()
  const { addSimulado } = useSimuladosStore()

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [questoes, setQuestoes] = useState<Omit<Questao, 'id'>[]>([
    {
      enunciado: '',
      alternativas: [
        { id: '1', texto: '', correta: true },
        { id: '2', texto: '', correta: false },
        { id: '3', texto: '', correta: false },
        { id: '4', texto: '', correta: false },
      ],
      explicacao: '',
      materia: '',
      assunto: '',
    }
  ])
  const [showImportModal, setShowImportModal] = useState(false)
  const [importError, setImportError] = useState('')
  const [importText, setImportText] = useState('')
  const [importTab, setImportTab] = useState<'json' | 'text'>('text')

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

    // Criar simulado
    const simuladoId = addSimulado({
      titulo,
      descricao,
      questoes: questoesComId,
    })

    // Redirecionar para a página do simulado
    router.push('/simulados')
  }

  const handleImportarQuestoes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        
        // Validar estrutura do JSON
        if (!Array.isArray(json)) {
          throw new Error('O arquivo deve conter um array de questões')
        }

        // Validar cada questão
        const questoesValidas = json.every((q: any) => {
          return (
            typeof q.enunciado === 'string' &&
            Array.isArray(q.alternativas) &&
            q.alternativas.length === 5 &&
            q.alternativas.every((alt: any) => 
              typeof alt.texto === 'string' &&
              typeof alt.correta === 'boolean'
            ) &&
            typeof q.materia === 'string' &&
            typeof q.assunto === 'string'
          )
        })

        if (!questoesValidas) {
          throw new Error('Formato inválido de questões')
        }

        // Adicionar as questões
        setQuestoes(prev => [...prev, ...json])
        setShowImportModal(false)
        setImportError('')

      } catch (error) {
        setImportError('Erro ao importar questões. Verifique o formato do arquivo.')
      }
    }
    reader.readAsText(file)
  }

  const processImportText = () => {
    try {
      // 1. Normaliza o texto removendo espaços extras e quebras de linha desnecessárias
      const textoLimpo = importText
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // 2. Identifica blocos de questões (separados por linhas em branco duplas ou //)
      const blocos = textoLimpo.split(/\n{2,}|\/{2,}/).map(b => b.trim()).filter(b => b);

      if (blocos.length === 0) {
        throw new Error('Nenhuma questão encontrada no texto.');
      }

      // 3. Processa cada bloco como uma questão
      const novasQuestoes = blocos.map((bloco, index) => {
        // Divide em linhas e remove linhas vazias
        const linhas = bloco.split('\n').map(l => l.trim()).filter(l => l);

        if (linhas.length < 2) {
          throw new Error(`Questão ${index + 1}: Formato inválido. É necessário ter um enunciado e alternativas.`);
        }

        // Identifica o enunciado (primeira linha ou linhas até encontrar padrão de alternativa)
        let enunciadoLinhas: string[] = [];
        let alternativasLinhas: string[] = [];
        let encontrouAlternativa = false;

        for (const linha of linhas) {
          // Verifica se é uma alternativa pelo padrão
          const ehAlternativa = /^[A-Ea-e][)\.]\s+|^[A-Ea-e]\s*[-]\s*|^[A-Ea-e]\s+/.test(linha);
          
          if (ehAlternativa) {
            encontrouAlternativa = true;
            alternativasLinhas.push(linha);
          } else if (!encontrouAlternativa) {
            enunciadoLinhas.push(linha);
          } else {
            // Se já encontrou alternativa e não é alternativa, pode ser continuação da última
            if (alternativasLinhas.length > 0) {
              alternativasLinhas[alternativasLinhas.length - 1] += ' ' + linha;
            }
          }
        }

        const enunciado = enunciadoLinhas.join('\n');

        // Processa alternativas
        const alternativas = alternativasLinhas
          .map(texto => {
            // Remove prefixos de alternativa (A), B), etc)
            const limpo = texto.replace(/^[A-Ea-e][)\.]\s+|^[A-Ea-e]\s*[-]\s*|^[A-Ea-e]\s+/, '').trim();
            return {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              texto: limpo,
              correta: false
            };
          })
          .filter(alt => alt.texto); // Remove alternativas vazias

        // Valida número de alternativas
        if (alternativas.length < 2) {
          throw new Error(`Questão ${index + 1}: Número insuficiente de alternativas. Encontradas: ${alternativas.length}`);
        }

        // Marca primeira alternativa como correta
        if (alternativas.length > 0) {
          alternativas[0].correta = true;
        }

        // Completa até 5 alternativas se necessário
        while (alternativas.length < 5) {
          alternativas.push({
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            texto: '',
            correta: false
          });
        }

        return {
          enunciado,
          alternativas,
          materia: 'Importada',
          assunto: 'Importada',
          explicacao: ''
        };
      });

      setQuestoes(prev => [...prev, ...novasQuestoes]);
      setShowImportModal(false);
      setImportText('');
      setImportError('');

    } catch (error: any) {
      console.error('Erro ao processar texto:', error);
      setImportError(error.message || 'Erro ao processar o texto. Verifique o formato.');
    }
  };

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
              Novo Simulado
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
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Questões
                </h2>
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Importar Questões
                  </motion.button>
                </div>
              </div>

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

            {/* Modal de Importação */}
            {showImportModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] flex flex-col"
                >
                  {/* Cabeçalho Fixo */}
                  <div className="flex-none border-b border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Importar Questões
                      </h3>
                      <button
                        onClick={() => setShowImportModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Abas */}
                    <div className="px-6 pb-4 flex gap-4">
                      <button
                        onClick={() => setImportTab('text')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          importTab === 'text'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Colar Texto
                      </button>
                      <button
                        onClick={() => setImportTab('json')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          importTab === 'json'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Arquivo JSON
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo Rolável */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {importTab === 'text' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cole suas questões
                          </label>
                          <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            rows={10}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                            placeholder="Qual é a capital do Brasil?&#10;A) Brasília&#10;B) São Paulo&#10;C) Rio de Janeiro&#10;D) Salvador&#10;&#10;Quem descobriu o Brasil?&#10;A. Pedro Álvares Cabral&#10;B. Cristóvão Colombo&#10;C. Vasco da Gama&#10;D. Dom Pedro I"
                          />
                        </div>

                        {importError && (
                          <p className="text-sm text-red-500 dark:text-red-400">
                            {importError}
                          </p>
                        )}

                        <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Formato Esperado
                          </h4>
                          <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
{`Qual é a capital do Brasil?
A) Brasília
B) São Paulo
C) Rio de Janeiro
D) Salvador

Quem descobriu o Brasil?
A. Pedro Álvares Cabral
B. Cristóvão Colombo
C. Vasco da Gama
D. Dom Pedro I

Em que ano o Brasil foi descoberto?
A - 1500
B - 1488
C - 1492
D - 1503`}
                          </pre>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Observações:
                            • A primeira alternativa (A) será marcada como correta
                            • Você pode usar A), A. ou A - para as alternativas
                            • Separe as questões com uma linha em branco
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportarQuestoes}
                          className="block w-full text-sm text-gray-500 dark:text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-medium
                            file:bg-purple-50 file:text-purple-700
                            dark:file:bg-purple-900/30 dark:file:text-purple-300
                            hover:file:bg-purple-100 dark:hover:file:bg-purple-900/40
                            file:cursor-pointer
                          "
                        />

                        {importError && (
                          <p className="text-sm text-red-500 dark:text-red-400">
                            {importError}
                          </p>
                        )}

                        <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Formato JSON Esperado
                          </h4>
                          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
{`[
  {
    "enunciado": "Texto da questão",
    "alternativas": [
      { "texto": "Alternativa A", "correta": true },
      { "texto": "Alternativa B", "correta": false },
      { "texto": "Alternativa C", "correta": false },
      { "texto": "Alternativa D", "correta": false },
      { "texto": "Alternativa E", "correta": false }
    ],
    "materia": "Nome da matéria",
    "assunto": "Nome do assunto",
    "explicacao": "Explicação opcional"
  }
]`}
                          </pre>
                        </div>

                        <div className="flex justify-end gap-4">
                          <motion.button
                            type="button"
                            onClick={() => setShowImportModal(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botões Fixos no Rodapé */}
                  <div className="flex-none border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-end gap-4">
                      <motion.button
                        type="button"
                        onClick={() => setShowImportModal(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                      >
                        Cancelar
                      </motion.button>
                      {importTab === 'text' && (
                        <motion.button
                          type="button"
                          onClick={processImportText}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                        >
                          Importar
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                Salvar Simulado
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default NovoSimuladoPage 