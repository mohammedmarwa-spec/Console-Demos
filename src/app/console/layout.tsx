import PlaygroundShellLoader from '../../components/playground/PlaygroundShellLoader'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <PlaygroundShellLoader>{children}</PlaygroundShellLoader>
}
