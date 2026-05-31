import { useState } from 'react'

export function useClientState<T>(initialValue: T) {
  return useState<T>(initialValue)
}
