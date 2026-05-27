type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
}

function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="section-header">
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}

export default SectionHeader
