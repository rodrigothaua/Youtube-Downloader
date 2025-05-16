"use client"

import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Atualiza o valor debounced após o atraso
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancela o timeout se o valor mudar ou o componente desmontar
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
