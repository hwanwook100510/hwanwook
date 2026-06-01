import { useEffect, useState } from 'react'

export function useClientState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const savedValue = window.localStorage.getItem(key)
      return savedValue ? JSON.parse(savedValue) as T : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage can be unavailable in private or restricted browser modes.
    }
  }, [key, value])

  return [value, setValue] as const
}
