import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Interface para a resposta da API
interface ApiResponse {
  status: string
  url?: string
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get("v")
    const format = request.nextUrl.searchParams.get("format") || "mp4"

    if (!videoId) {
      return NextResponse.json({ error: "ID do vídeo é obrigatório" }, { status: 400 })
    }

    // Obtém o título do vídeo para o nome do arquivo
    const videoInfo = await getVideoInfo(videoId)
    const fileName = sanitizeFileName(`${videoInfo.title || "video"}.${format}`)

    // Obtém a URL de download direta
    const downloadUrl = await getDirectDownloadUrl(videoId, format)

    if (!downloadUrl) {
      throw new Error("Não foi possível obter a URL de download")
    }

    // Baixa o conteúdo do vídeo
    const videoResponse = await fetch(downloadUrl)

    if (!videoResponse.ok) {
      throw new Error(`Falha ao baixar o vídeo: ${videoResponse.statusText}`)
    }

    // Obtém o conteúdo como um array de bytes
    const videoBuffer = await videoResponse.arrayBuffer()

    // Configura os headers para download
    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`)
    headers.set("Content-Type", format === "mp3" ? "audio/mpeg" : "video/mp4")
    headers.set("Content-Length", videoBuffer.byteLength.toString())

    // Retorna o vídeo como um arquivo para download
    return new NextResponse(videoBuffer, {
      status: 200,
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

// Função para obter a URL de download direta
async function getDirectDownloadUrl(videoId: string, format: string): Promise<string | null> {
  try {
    // Usamos uma API que fornece URLs diretas de download
    const apiUrl = "https://co.wuk.sh/api/json"
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: videoUrl,
        vQuality: "720p",
        filenamePattern: "basic",
        isAudioOnly: format === "mp3",
        disableMetadata: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`API respondeu com status: ${response.status}`)
    }

    const data = (await response.json()) as ApiResponse

    if (data.status !== "success" || !data.url) {
      throw new Error(data.error || "Falha ao obter URL de download")
    }

    return data.url
  } catch (error) {
    console.error("Erro ao obter URL de download:", error)
    return null
  }
}
