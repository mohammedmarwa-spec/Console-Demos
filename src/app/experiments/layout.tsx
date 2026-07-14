import PlaygroundShellLoader from '../../components/playground/PlaygroundShellLoader'

/**
 * Experiments render outside /console/*, but reuse the same console shell +
 * mock state so pages can call usePlaygroundState()/ExperimentPageShell.
 */
export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return <PlaygroundShellLoader>{children}</PlaygroundShellLoader>
}
