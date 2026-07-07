'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useScenario } from '../../../../scenarios'
import { getEntryById } from '../../../../registry'
import { getInitialPathForScenario } from '../../../../lib/navigation'

export default function ExperimentLauncher() {
  const params = useParams<{ owner: string; slug: string }>()
  const router = useRouter()
  const { setScenario, activeScenarioId } = useScenario()

  const experimentId = `experiment/${params.owner}/${params.slug}`

  useEffect(() => {
    const entry = getEntryById(experimentId)
    if (!entry) {
      router.replace('/')
      return
    }
    if (activeScenarioId !== experimentId) {
      setScenario(experimentId)
    }
    const path = getInitialPathForScenario(experimentId)
    router.replace(`${path}?scenario=${encodeURIComponent(experimentId)}`)
  }, [experimentId, activeScenarioId, setScenario, router])

  return null
}
