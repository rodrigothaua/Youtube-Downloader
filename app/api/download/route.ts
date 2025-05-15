import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, itag } = await request.json()

    if (!url || !itag) {
      return NextResponse.json({ error: "URL e formato são obrigatórios" }, { status: 400 })
    }

    // Verifica se a URL é válida
    if (!isValidYoutubeUrl(url)) {
      return NextResponse.json({ error: "URL do YouTube inválida" }, { status: 400 })
    }

    // Extrai o ID do vídeo
    const videoId = extractVideoId(url)

    if (!videoId) {
      return NextResponse.json({ error: "Não foi possível extrair o ID do vídeo" }, { status: 400 })
    }

    // Mapeia o itag para o formato do serviço de download
    const formatMap: Record<number, string> = {
      22: "720p", // 720p
      18: "480p", // 480p
      134: "360p", // 360p
      140: "mp3", // MP3 (Áudio)
    }

    const format = formatMap[itag] || "720p"

    // Cria a URL para o download direto
    const downloadUrl = `/api/direct-download?v=${videoId}&f=${format}`

    // Obtém o título do vídeo para o nome do arquivo
    const videoTitle = await getVideoTitle(videoId)
    const extension = format === "mp3" ? "mp3" : "mp4"
    const fileName = sanitizeFileName(`${videoTitle}.${extension}`)

    return NextResponse.json({
      downloadUrl,
      fileName,
    })
  } catch (error) {
    console.error("Erro ao processar download:", error)
    return NextResponse.json({ error: "Falha ao processar o download. Tente novamente." }, { status: 500 })
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

// Função para obter o título do vídeo
async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const response = await fetch(oembedUrl)

    if (!response.ok) {
      return "video"
    }

    const data = await response.json()
    return data.title || "video"
  } catch (error) {
    return "video"
  }
}

// Função para sanitizar o nome do arquivo
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[/\\?%*:|"<>]/g, "-") // Remove caracteres inválidos para nomes de arquivo
    .replace(/\s+/g, "_") // Substitui espaços por underscores
    .substring(0, 100) // Limita o tamanho do nome
}
