'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScenario } from '../../scenarios'
import { getInitialPathForScenario } from '../../lib/navigation'

export default function ConsoleIndexPage() {
  const router = useRouter()
  const { activeScenarioId } = useScenario()

  useEffect(() => {
    const path = getInitialPathForScenario(activeScenarioId)
    const scenarioParam = activeScenarioId ? `?scenario=${encodeURIComponent(activeScenarioId)}` : ''
    router.replace(`${path}${scenarioParam}`)
  }, [activeScenarioId, router])

  return null
}
