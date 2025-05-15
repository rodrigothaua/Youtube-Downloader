import { YoutubeDownloader } from "@/components/youtube-downloader"
import { AdBanner } from "@/components/ad-banner"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Banner de anúncio superior */}
          <AdBanner className="mb-8" position="top" />

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Baixe Vídeos do YouTube</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Baixe seus vídeos favoritos do YouTube de forma rápida e fácil
            </p>
          </div>

          {/* Componente principal de download */}
          <YoutubeDownloader />

          {/* Banner de anúncio lateral */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">Como usar</h2>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Cole o link do vídeo do YouTube no campo acima</li>
                <li>Clique no botão "Verificar Vídeo"</li>
                <li>Escolha a qualidade de download desejada</li>
                <li>Clique em "Baixar" e aguarde o processamento</li>
              </ol>
            </div>
            <AdBanner className="h-full" position="sidebar" />
          </div>

          {/* Banner de anúncio inferior */}
          <AdBanner className="mt-12" position="bottom" />
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} YouTube Downloader. Este serviço é apenas para uso educacional.
          </p>
        </div>
      </footer>
    </div>
  )
}
