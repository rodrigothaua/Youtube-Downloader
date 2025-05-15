import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Obtém o token da URL
    const token = request.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token de download inválido" }, { status: 400 })
    }

    // Decodifica o token
    const decodedToken = Buffer.from(token, "base64").toString()
    const [videoId, itag, timestamp] = decodedToken.split(":")

    // Verifica se o token é válido (não expirado - 1 hora de validade)
    const tokenTime = Number.parseInt(timestamp)
    if (isNaN(tokenTime) || Date.now() - tokenTime > 3600000) {
      return NextResponse.json({ error: "Token de download expirado" }, { status: 400 })
    }

    // Obtém o título do vídeo para o nome do arquivo
    const videoTitle = await getVideoTitle(videoId)
    const extension = itag === "140" ? "mp3" : "mp4"
    const fileName = sanitizeFileName(`${videoTitle}.${extension}`)

    // Gera a URL para o serviço de download
    const downloadUrl = generateDownloadUrl(videoId, itag)

    // Configura os headers para download
    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`)
    headers.set("Location", downloadUrl)

    // Retorna um redirecionamento 302 para o serviço de download
    return new NextResponse(null, {
      status: 302,
      headers,
    })
  } catch (error) {
    console.error("Erro ao processar download do arquivo:", error)
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

// Função para gerar a URL de download usando um serviço de download
function generateDownloadUrl(videoId: string, itag: string): string {
  // Usamos o serviço y2mate como exemplo
  // Este é um serviço popular para download de vídeos do YouTube
  // Nota: Em um ambiente de produção, você pode querer usar uma API oficial ou um serviço pago

  // Mapeamento de itags para formatos no y2mate
  const formatMap: Record<string, string> = {
    "22": "mp4a720", // 720p
    "18": "mp4a480", // 480p
    "134": "mp4a360", // 360p
    "140": "mp3128", // MP3 (Áudio)
  }

  const format = formatMap[itag] || "mp4a720"

  // Construir a URL para o serviço de download
  return `https://www.y2mate.com/youtube/${videoId}/${format}`
}
