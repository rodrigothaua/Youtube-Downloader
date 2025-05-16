"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Download, Youtube, AlertCircle, Clock, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDuration, formatNumber } from "@/lib/format-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"

interface VideoInfo {
  videoId: string
  title: string
  thumbnail: string
  lengthSeconds: string
  author: string
  viewCount: string
  formats: {
    label: string
    itag: number
  }[]
}

export function YoutubeDownloader() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<string>("mp4")

  // Usar debounce para não fazer muitas requisições enquanto digita
  const debouncedUrl = useDebounce(url, 800)

  // Ref para controlar se o componente está montado
  const isMounted = useRef(true)

  // Efeito para limpar na desmontagem
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Efeito para carregar o vídeo automaticamente quando a URL mudar (após o debounce)
  useEffect(() => {
    if (debouncedUrl && isValidYoutubeUrl(debouncedUrl)) {
      fetchVideoInfo(debouncedUrl)
    } else if (debouncedUrl) {
      setError("Por favor, insira um link válido do YouTube")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUrl])

  const isValidYoutubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(.*)$/
    return regex.test(url)
  }

  const fetchVideoInfo = async (videoUrl: string) => {
    if (!videoUrl || !isValidYoutubeUrl(videoUrl)) {
      return
    }

    setError("")
    setLoading(true)
    setVideoInfo(null)

    try {
      const response = await fetch("/api/video-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl }),
      })

      if (!isMounted.current) return

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao processar o vídeo")
      }

      const data = await response.json()
      setVideoInfo(data)
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "Erro ao processar o vídeo. Tente novamente.")
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)

    // Limpa o erro se o campo estiver vazio
    if (!newUrl) {
      setError("")
      setVideoInfo(null)
    }
  }

  const handleDownload = async (format: { itag: number; label: string }) => {
    if (!videoInfo) return

    setDownloading(format.itag)
    setDownloadProgress(0)
    setDownloadError(null)

    try {
      // Determina o formato com base na seleção do usuário
      const outputFormat = selectedFormat

      // Abre o download em uma nova aba para evitar problemas de navegação
      window.open(`/api/download-video?v=${videoInfo.videoId}&format=${outputFormat}`, "_blank")

      // Simula progresso de download (apenas visual)
      const interval = setInterval(() => {
        if (!isMounted.current) {
          clearInterval(interval)
          return
        }

        setDownloadProgress((prev) => {
          if (prev === null) return 0
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 500)

      // Limpa o progresso após um tempo
      setTimeout(() => {
        if (!isMounted.current) return

        clearInterval(interval)
        setDownloadProgress(null)
        setDownloading(null)
      }, 10000)
    } catch (err) {
      if (isMounted.current) {
        setDownloadError(err instanceof Error ? err.message : "Erro ao iniciar o download. Tente novamente.")
        setDownloading(null)
        setDownloadProgress(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative flex-grow">
              <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Cole o link do YouTube aqui para detecção automática"
                value={url}
                onChange={handleUrlChange}
                className="pl-10"
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                <span className="ml-2 text-sm text-gray-500">Buscando informações do vídeo...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {videoInfo && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={videoInfo.thumbnail || "/placeholder.svg"}
                    alt={videoInfo.title}
                    className="w-full rounded-md object-cover"
                  />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <h3 className="text-xl font-bold">{videoInfo.title}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{formatDuration(Number.parseInt(videoInfo.lengthSeconds))}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      <span>{formatNumber(Number.parseInt(videoInfo.viewCount))} visualizações</span>
                    </div>
                    <div>
                      <span>Canal: {videoInfo.author}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <h4 className="font-medium">Formato de saída:</h4>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (Vídeo)</SelectItem>
                          <SelectItem value="mp3">MP3 (Áudio)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <h4 className="font-medium">Escolha a qualidade:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {videoInfo.formats.map((format) => (
                        <Button
                          key={format.itag}
                          variant="outline"
                          className="justify-start"
                          onClick={() => handleDownload(format)}
                          disabled={downloading !== null}
                        >
                          {downloading === format.itag ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {downloadProgress !== null ? `${downloadProgress}%` : "Processando..."}
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              {format.label}
                            </>
                          )}
                        </Button>
                      ))}
                    </div>

                    {downloadError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{downloadError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
