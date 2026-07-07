import { vi } from 'vitest'

vi.mock('next/navigation', () => require('next-router-mock/navigation'))

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
