import { cn } from "@/lib/utils"

interface AdBannerProps {
  className?: string
  position: "top" | "sidebar" | "bottom"
}

export function AdBanner({ className, position }: AdBannerProps) {
  // Definir tamanhos diferentes com base na posição
  const getAdSize = () => {
    switch (position) {
      case "top":
        return "h-24 sm:h-28"
      case "sidebar":
        return "h-full min-h-[250px]"
      case "bottom":
        return "h-28"
      default:
        return "h-24"
    }
  }

  return (
    <div
      className={cn(
        "bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center",
        getAdSize(),
        className,
      )}
    >
      <div className="text-center px-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Espaço para anúncio do Google Ads</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          {position === "top" ? "Banner superior" : position === "sidebar" ? "Banner lateral" : "Banner inferior"}
        </p>
      </div>
    </div>
  )
}
