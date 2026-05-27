type ProgressBarProps = {
  value: number
  label?: string
}

function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="progress-wrap" aria-label={label}>
      <div className="progress-meta">
        {label && <span>{label}</span>}
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
