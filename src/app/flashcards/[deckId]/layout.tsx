import { use } from 'react'

export default function DeckLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = use(params)
  
  return (
    <section>
      <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Deck {deckId}
          </h1>
        </div>
      </header>
      {children}
    </section>
  )
} 