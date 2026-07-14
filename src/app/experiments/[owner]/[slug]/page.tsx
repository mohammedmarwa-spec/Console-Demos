import { discoverAllRoutes, loadPage } from '@/lib/experiments/discover.server'

export function generateStaticParams() {
  return discoverAllRoutes()
}

export default async function ExperimentRoutePage({
  params,
}: {
  params: Promise<{ owner: string; slug: string }>
}) {
  const { owner, slug } = await params
  const Page = await loadPage(owner, slug)
  return <Page />
}
