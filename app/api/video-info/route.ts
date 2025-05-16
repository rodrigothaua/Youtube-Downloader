import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verificar se request está definido
    if (!request) {
      throw new Error("Request não definido")
    }

    // Obter o corpo da requisição
    const body = await request.json().catch(() => ({}))
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "URL do vídeo é obrigatória" }, { status: 400 })
    }

    // Verifica se a URL é válida
    if (!isValidYoutubeUrl(url)) {
      return NextResponse.json({ error: "URL do YouTube inválida" }, { status: 400 })
    }

    // Extrai o ID do vídeo da URL
    const videoId = extractVideoId(url)

    if (!videoId) {
      return NextResponse.json({ error: "Não foi possível extrair o ID do vídeo" }, { status: 400 })
    }

    // Obtém informações do vídeo usando a API do YouTube
    const videoInfo = await fetchVideoInfo(videoId)

    return NextResponse.json(videoInfo)
  } catch (error) {
    console.error("Erro ao processar informações do vídeo:", error)
    return NextResponse.json({ error: "Falha ao processar o vídeo. Tente novamente." }, { status: 500 })
  }
}

// Função para validar URL do YouTube
function isValidYoutubeUrl(url: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(.*)$/
  return regex.test(url)
}

// Função para extrair o ID do vídeo da URL
function extractVideoId(url: string): string | null {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(.*)$/
  const match = url.match(regex)
  return match ? match[4] : null
}

// Função para buscar informações do vídeo
async function fetchVideoInfo(videoId: string) {
  try {
    // Busca informações básicas do vídeo usando a API de oEmbed do YouTube
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const oembedResponse = await fetch(oembedUrl)

    if (!oembedResponse.ok) {
      throw new Error("Não foi possível obter informações do vídeo")
    }

    const oembedData = await oembedResponse.json()

    // Cria um objeto com as informações do vídeo
    const videoInfo = {
      videoId: videoId,
      title: oembedData.title || "Título não disponível",
      author: oembedData.author_name || "Autor desconhecido",
      lengthSeconds: "0", // Não disponível via oembed
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      viewCount: "0", // Não disponível via oembed
    }

    // Formatos disponíveis para download
    // Em um ambiente real, você determinaria isso dinamicamente
    const formats = [
      { label: "720p", itag: 22, qualityLabel: "720p", mimeType: "video/mp4" },
      { label: "480p", itag: 18, qualityLabel: "480p", mimeType: "video/mp4" },
      { label: "360p", itag: 134, qualityLabel: "360p", mimeType: "video/mp4" },
      { label: "MP3 (Áudio)", itag: 140, mimeType: "audio/mp4" },
    ]

    return {
      ...videoInfo,
      formats,
    }
  } catch (error) {
    console.error("Erro ao buscar informações do vídeo:", error)
    throw error
  }
}
