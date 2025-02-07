import { motion } from 'framer-motion'
import { X, HelpCircle, Brain, Clock, Calendar, Target, Award } from 'lucide-react'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  if (!isOpen) return null

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      title: "Repetição Espaçada",
      description: "O sistema ajusta automaticamente o intervalo entre as revisões com base no seu desempenho. Quanto melhor você se sair, mais tempo até a próxima revisão."
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Níveis de Dificuldade",
      description: "Ao responder um card, você indica o quão difícil foi: 'Muito Difícil', 'Com Esforço' ou 'Fácil'. Isso ajuda o sistema a ajustar os intervalos."
    },
    {
      icon: <Clock className="w-6 h-6 text-green-500" />,
      title: "Múltiplas Rodadas",
      description: "Em cada sessão de estudo, os cards que você tem mais dificuldade são repetidos até 3 vezes para reforçar o aprendizado."
    },
    {
      icon: <Calendar className="w-6 h-6 text-red-500" />,
      title: "Agendamento Inteligente",
      description: "O sistema agenda as revisões em intervalos crescentes: 1 dia, 3 dias, 7 dias, etc., otimizando seu tempo de estudo."
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      title: "Nível de Domínio",
      description: "O domínio de cada deck é calculado considerando seu histórico de respostas, intervalos de revisão e consistência no aprendizado."
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Como Funciona o Sistema de Flashcards
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Nosso sistema usa técnicas avançadas de repetição espaçada para otimizar seu aprendizado.
          </p>
        </div>

        <div className="space-y-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
            Dica para Melhor Aproveitamento
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Seja honesto ao avaliar seu conhecimento. É melhor marcar um card como "Muito Difícil" 
            e revisá-lo mais cedo do que marcá-lo como "Fácil" e esquecê-lo quando precisar.
          </p>
        </div>
      </motion.div>
    </div>
  )
} 