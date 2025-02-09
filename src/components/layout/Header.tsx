'use client'

import React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Sun, Moon, Brain, Calendar, Trophy, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      {/* Header Desktop */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 hidden md:block">
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo e Nome */}
              <Link 
                href="/" 
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
          Genoma Study
        </Link>

              {/* Menu Principal */}
              <div className="flex items-center space-x-6">
                <Link 
                  href="/flashcards" 
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Flashcards</span>
                </Link>
                
                <Link 
                  href="/simulados" 
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Simulados</span>
                </Link>
                
                <Link 
                  href="/agenda" 
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agenda</span>
                </Link>
                
                <Link 
                  href="/conquistas" 
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Conquistas</span>
                </Link>

                {/* Botão de Tema */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Menu Inferior Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around items-center px-2 py-3">
          <Link href="/">
            <div className="flex flex-col items-center gap-1">
              <Brain className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Home</span>
            </div>
          </Link>

          <Link href="/flashcards">
            <div className="flex flex-col items-center gap-1">
              <Brain className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Flashcards</span>
            </div>
          </Link>

          <Link href="/simulados">
            <div className="flex flex-col items-center gap-1">
              <FlaskConical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Simulados</span>
            </div>
          </Link>

          <Link href="/agenda">
            <div className="flex flex-col items-center gap-1">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Agenda</span>
            </div>
          </Link>

          <Link href="/conquistas">
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Conquistas</span>
            </div>
          </Link>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex flex-col items-center gap-1"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Escuro</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </>
  )
} 