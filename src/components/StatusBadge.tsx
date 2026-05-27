import type { Status } from '../types'

type StatusBadgeProps = {
  status: Status
}

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status status-${status.replaceAll(' ', '-')}`}>{status}</span>
}

export default StatusBadge
