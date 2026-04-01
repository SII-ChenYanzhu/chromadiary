type Props = {
  className?: string
}

export function ThemeBackdropArt({ className = '' }: Props) {
  return (
    <div className={`theme-art ${className}`.trim()} aria-hidden="true">
      <span className="theme-art-planet theme-art-planet-lg" />
      <span className="theme-art-planet theme-art-planet-sm" />
      <span className="theme-art-cloud theme-art-cloud-a" />
      <span className="theme-art-cloud theme-art-cloud-b" />
      <span className="theme-art-ring" />
      <span className="theme-art-stars" />
    </div>
  )
}
