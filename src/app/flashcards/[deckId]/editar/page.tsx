'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Save, FileText, X, AlertTriangle, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFlashcardsStore } from '@/store/useFlashcardsStore'
import { use } from 'react'
import type { Card } from '@/store/useFlashcardsStore'

interface PageProps {
  params: Promise<{ deckId: string }>
}

export default function EditarDeckPage({ params }: PageProps) {
  const router = useRouter()
  const { deckId } = use(params)
  const { getDeck, atualizarDeck } = useFlashcardsStore()
  const deckOriginal = getDeck(deckId)

  const [deck, setDeck] = useState(deckOriginal ? {
    titulo: deckOriginal.titulo,
    descricao: deckOriginal.descricao,
    cards: deckOriginal.cards
  } : null)

  const [novoCard, setNovoCard] = useState({
    front: '',
    back: ''
  })

  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (!deck) {
    router.push('/flashcards')
    return null
  }

  const handleAdicionarCard = () => {
    if (novoCard.front.trim() && novoCard.back.trim()) {
      setDeck(prev => ({
        ...prev!,
        cards: [
          ...prev!.cards,
          {
            id: Date.now().toString(),
            ...novoCard,
            totalEstudos: 0,
            acertos: 0,
            erros: 0,
            ultimoEstudo: null
          }
        ]
      }))
      setNovoCard({
        front: '',
        back: ''
      })
      setSuccessMessage('Card adicionado com sucesso!')
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleRemoverCard = (cardId: string) => {
    setDeck(prev => ({
      ...prev!,
      cards: prev!.cards.filter(card => card.id !== cardId)
    }))
  }

  const handleSalvar = () => {
    if (deck.titulo.trim() && deck.cards.length > 0) {
      atualizarDeck(deckId, deck)
      router.push('/flashcards')
    }
  }

  const processarCardsEmMassa = () => {
    try {
      // Divide o texto em linhas e remove linhas vazias
      const linhas = bulkText.split('\n').filter(linha => linha.trim())

      // Algoritmo para detectar o padrão de separação
      let separador = ''
      const possiveisSeparadores = [':', '-', '=', '|', '\t']
      
      for (const sep of possiveisSeparadores) {
        if (linhas[0].includes(sep)) {
          separador = sep
          break
        }
      }

      if (!separador) {
        // Se não encontrou separador, tenta dividir por linhas alternadas
        const novosCards = []
        for (let i = 0; i < linhas.length; i += 2) {
          if (i + 1 < linhas.length) {
            novosCards.push({
              front: linhas[i].trim(),
              back: linhas[i + 1].trim()
            })
          }
        }
        if (novosCards.length === 0) {
          throw new Error('Não foi possível identificar um padrão válido no texto')
        }
        adicionarCardsProcessados(novosCards)
        return
      }

      // Processa cada linha usando o separador encontrado
      const novosCards = linhas.map(linha => {
        const [front, ...backParts] = linha.split(separador)
        const back = backParts.join(separador)

        if (!front.trim() || !back.trim()) {
          throw new Error('Algumas linhas não possuem frente ou verso válidos')
        }

        return {
          front: front.trim(),
          back: back.trim()
        }
      })

      adicionarCardsProcessados(novosCards)
      setShowBulkModal(false)
      setBulkError(null)
      setBulkText('')
      setSuccessMessage(`${novosCards.length} cards adicionados com sucesso!`)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Erro ao processar os cards')
    }
  }

  const adicionarCardsProcessados = (novosCards: { front: string, back: string }[]) => {
    setDeck(prev => ({
      ...prev!,
      cards: [
        ...prev!.cards,
        ...novosCards.map(card => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...card,
          totalEstudos: 0,
          acertos: 0,
          erros: 0,
          ultimoEstudo: null
        }))
      ]
    }))
  }

  const exportarCards = () => {
    const cardsFormatados = deck.cards.map(card => `${card.front} : ${card.back}`).join('\n')
    const blob = new Blob([cardsFormatados], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deck.titulo.toLowerCase().replace(/\s+/g, '-')}-cards.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportarDeck = () => {
    const deckFormatado = [{
      titulo: deck.titulo,
      descricao: deck.descricao,
      cards: deck.cards.map(card => ({
        front: card.front,
        back: card.back
      }))
    }]
    const blob = new Blob([JSON.stringify(deckFormatado, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deck.titulo.toLowerCase().replace(/\s+/g, '-')}-deck.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/flashcards">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </motion.button>
          </Link>
          <div className="flex gap-4">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportarCards}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exportar Cards (.txt)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportarDeck}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exportar Deck (.json)
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSalvar}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              disabled={!deck.titulo.trim() || deck.cards.length === 0}
            >
              <Save className="w-5 h-5" />
              Salvar Alterações
            </motion.button>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
            >
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informações do Deck */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Informações do Deck
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título
              </label>
              <input
                type="text"
                value={deck.titulo}
                onChange={(e) => setDeck(prev => ({ ...prev!, titulo: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o título do deck"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                value={deck.descricao}
                onChange={(e) => setDeck(prev => ({ ...prev!, descricao: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite uma descrição para o deck"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Adicionar Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                Adicionar Cards
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adicione cards individualmente ou use a opção em massa para maior produtividade
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBulkModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
            >
              <FileText className="w-5 h-5" />
              Adicionar em Massa
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frente
              </label>
              <textarea
                value={novoCard.front}
                onChange={(e) => setNovoCard(prev => ({ ...prev, front: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o conteúdo da frente do card"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verso
              </label>
              <textarea
                value={novoCard.back}
                onChange={(e) => setNovoCard(prev => ({ ...prev, back: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o conteúdo do verso do card"
                rows={3}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdicionarCard}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            disabled={!novoCard.front.trim() || !novoCard.back.trim()}
          >
            <Plus className="w-5 h-5" />
            Adicionar Card
          </motion.button>
        </div>

        {/* Lista de Cards */}
        <div className="space-y-4">
          {deck.cards.map((card, index) => (
            <motion.div
              key={card.id}
              layout
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Card {index + 1}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoverCard(card.id)}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Frente
                  </label>
                  <p className="text-gray-900 dark:text-white">{card.front}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Verso
                  </label>
                  <p className="text-gray-900 dark:text-white">{card.back}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de Importação em Massa */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8"
            onClick={() => setShowBulkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 my-auto flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Fixo */}
              <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Adicionar Cards em Massa
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Cole seu texto abaixo. O sistema tentará identificar automaticamente o padrão de separação.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo Rolável */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                    Usando IA para criar flashcards?
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-2">
                    Use o seguinte prompt para gerar cards no formato correto:
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
                    Crie flashcards para [seu tema] no seguinte formato:
                    <br />
                    Pergunta 1 : Resposta 1
                    <br />
                    Pergunta 2 : Resposta 2
                    <br />
                    [continue com mais perguntas]
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Formatos aceitos:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>• Usando separadores (: - = | ou tab)</li>
                  <li>• Uma linha para frente, outra para verso</li>
                  <li>Exemplo 1: Pergunta : Resposta</li>
                  <li>Exemplo 2:<br />Pergunta 1<br />Resposta 1<br />Pergunta 2<br />Resposta 2</li>
                </ul>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Cole seu texto aqui..."
                  rows={8}
                />

                {bulkError && (
                  <div className="mt-4 flex items-start gap-3 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <p>{bulkError}</p>
                  </div>
                )}
              </div>

              {/* Footer Fixo */}
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={processarCardsEmMassa}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                    disabled={!bulkText.trim()}
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Cards
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
} 