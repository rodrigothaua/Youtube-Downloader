import { type NextRequest, NextResponse } from "next/server"
import fetch from "node-fetch"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get("v")
    const format = request.nextUrl.searchParams.get("format") || "mp4"

    if (!videoId) {
      return NextResponse.json({ error: "ID do vídeo é obrigatório" }, { status: 400 })
    }

    // Obtém o título do vídeo para o nome do arquivo
    const videoTitle = await getVideoTitle(videoId)
    const fileName = sanitizeFileName(`${videoTitle}.${format}`)

    // Usa um serviço alternativo para download
    // Este é um método de fallback que usa um serviço de proxy
    const proxyUrl = `https://api.vevioz.com/api/button/mp4/${videoId}`

    // Faz uma requisição para obter a página do serviço
    const response = await fetch(proxyUrl)
    const html = await response.text()

    // Extrai a URL de download direta (simplificado)
    const downloadUrlMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/)

    if (!downloadUrlMatch || !downloadUrlMatch[1]) {
      throw new Error("Não foi possível encontrar o link de download")
    }

    const downloadUrl = downloadUrlMatch[1]

    // Redireciona para a URL de download
    const headers = new Headers()
    headers.set("Location", downloadUrl)

    return new NextResponse(null, {
      status: 302,
      headers,
    })
  } catch (error) {
    console.error("Erro ao processar download alternativo:", error)

    // Se falhar, redireciona para um serviço externo como último recurso
    const videoId = request.nextUrl.searchParams.get("v")
    const fallbackUrl = `https://www.y2mate.com/youtube/${videoId}`

    const headers = new Headers()
    headers.set("Location", fallbackUrl)

    return new NextResponse(null, {
      status: 302,
      headers,
    })
  }
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
