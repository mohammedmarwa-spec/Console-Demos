import { vi } from 'vitest'

vi.mock('next/navigation', () => {
  const mockRouter = require('next-router-mock').default
  const navigation = require('next-router-mock/navigation')

  return {
    ...navigation,
    useParams: () => {
      const pathname = mockRouter.pathname as string
      const serviceMatch = pathname.match(/^\/console\/project\/services\/([^/]+)$/)
      if (serviceMatch) {
        return { serviceId: decodeURIComponent(serviceMatch[1]) }
      }
      const experimentMatch = pathname.match(/^\/experiments\/([^/]+)\/([^/]+)$/)
      if (experimentMatch) {
        return { owner: experimentMatch[1], slug: experimentMatch[2] }
      }
      return {}
    },
  }
})

vi.mock('next/link', () => {
  const React = require('react') as typeof import('react')
  const mockRouter = require('next-router-mock').default
  return {
    default: ({
      children,
      href,
      ...rest
    }: {
      children: React.ReactNode
      href: string
    }) =>
      React.createElement(
        'a',
        {
          ...rest,
          href,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault()
            mockRouter.push(href)
          },
        },
        children,
      ),
  }
})
