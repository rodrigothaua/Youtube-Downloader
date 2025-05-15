import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get("v")
    const format = request.nextUrl.searchParams.get("format") || "mp4"
    const itag = request.nextUrl.searchParams.get("itag")

    if (!videoId) {
      return NextResponse.json({ error: "ID do vídeo é obrigatório" }, { status: 400 })
    }

    // Gera a URL para o serviço de download direto
    // Usando o serviço de download direto do YouTube
    const downloadUrl = generateDownloadUrl(videoId, format, itag)

    // Obtém o título do vídeo para o nome do arquivo
    const videoTitle = await getVideoTitle(videoId)
    const fileName = sanitizeFileName(`${videoTitle}.${format}`)

    // Configura os headers para download
    const headers = new Headers()
    headers.set("Location", downloadUrl)

    // Retorna um redirecionamento 302 para o serviço de download
    return new NextResponse(null, {
      status: 302,
      headers,
    })
  } catch (error) {
    console.error("Erro ao processar download do servidor:", error)

    // Se falhar, redireciona para um serviço externo como último recurso
    const videoId = request.nextUrl.searchParams.get("v")
    if (videoId) {
      const fallbackUrl = `https://www.y2mate.com/youtube/${videoId}`

      const headers = new Headers()
      headers.set("Location", fallbackUrl)

      return new NextResponse(null, {
        status: 302,
        headers,
      })
    }

    return NextResponse.json(
      {
        error: "Falha ao baixar o arquivo. Tente novamente.",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// Função para gerar URL de download
function generateDownloadUrl(videoId: string, format: string, itag: string | null): string {
  // Usamos o serviço cobalt.tools que oferece uma API simples para download de vídeos
  const baseUrl = "https://co.wuk.sh/api/json"

  // Construímos a URL do vídeo
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Determinamos o formato de saída
  const outputFormat = format === "mp3" ? "mp3" : "mp4"

  // Construímos a URL completa
  return `${baseUrl}?url=${encodeURIComponent(videoUrl)}&vQuality=720p&filenamePattern=basic&isAudioOnly=${outputFormat === "mp3"}`
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
