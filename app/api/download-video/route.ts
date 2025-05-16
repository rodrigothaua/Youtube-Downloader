import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(request: NextRequest) {
  try {
    // Verificar se request está definido antes de acessar searchParams
    if (!request || !request.nextUrl) {
      throw new Error("Request ou nextUrl não definido")
    }

    const videoId = request.nextUrl.searchParams.get("v")
    const format = request.nextUrl.searchParams.get("format") || "mp4"

    if (!videoId) {
      return NextResponse.json({ error: "ID do vídeo é obrigatório" }, { status: 400 })
    }

    // Obtém o título do vídeo para o nome do arquivo
    const videoInfo = await getVideoInfo(videoId)
    const fileName = sanitizeFileName(`${videoInfo.title || "video"}.${format}`)

    // Redirecionamos para um serviço confiável de download do YouTube
    // Esta é uma abordagem mais robusta que funciona mesmo com mudanças na API do YouTube
    const downloadUrl = `https://youtube-downloader-by4h.onrender.com/${format === "mp3" ? "download/audio" : "download"}/${videoId}`

    // Configura os headers para redirecionamento
    const headers = new Headers()
    headers.set("Location", downloadUrl)

    // Retorna um redirecionamento 302 para o serviço de download
    return new NextResponse(null, {
      status: 302,
      headers,
    })
  } catch (error) {
    console.error("Erro ao processar download:", error)

    return NextResponse.json(
      {
        error: "Falha ao baixar o arquivo. Tente novamente.",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// Função para obter informações do vídeo
async function getVideoInfo(videoId: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const response = await fetch(oembedUrl)

    if (!response.ok) {
      return { title: "video" }
    }

    const data = await response.json()
    return {
      title: data.title || "video",
      author: data.author_name || "Unknown",
      thumbnail: data.thumbnail_url,
    }
  } catch (error) {
    console.error("Erro ao obter informações do vídeo:", error)
    return { title: "video" }
  }
}

// Função para sanitizar o nome do arquivo
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[/\\?%*:|"<>]/g, "-") // Remove caracteres inválidos para nomes de arquivo
    .replace(/\s+/g, "_") // Substitui espaços por underscores
    .substring(0, 100) // Limita o tamanho do nome
}
