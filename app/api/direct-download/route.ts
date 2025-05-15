import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get("v")
    const format = request.nextUrl.searchParams.get("f")

    if (!videoId || !format) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    // Obtém o título do vídeo para o nome do arquivo
    const videoTitle = await getVideoTitle(videoId)
    const extension = format.includes("mp3") ? "mp3" : "mp4"
    const fileName = sanitizeFileName(`${videoTitle}.${extension}`)

    // Gera a URL para o serviço de download direto
    // Nota: Este é um exemplo usando o serviço dlpanda, que permite download direto
    const downloadUrl = `https://dlpanda.com/pt?url=https://www.youtube.com/watch?v=${videoId}&format=${format}`

    // Configura os headers para download
    const headers = new Headers()
    headers.set("Location", downloadUrl)

    // Retorna um redirecionamento 302 para o serviço de download
    return new NextResponse(null, {
      status: 302,
      headers,
    })
  } catch (error) {
    console.error("Erro ao processar download direto:", error)
    return NextResponse.json({ error: "Falha ao baixar o arquivo. Tente novamente." }, { status: 500 })
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
