import { Link, useNavigate, useParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { clubs } from '../data/clubs'
import { useClientState } from '../hooks/useClientState'

const priorityLabels = {
  first: '1순위',
  second: '2순위',
  third: '3순위',
} as const

type Priority = keyof typeof priorityLabels

function isPriority(value: string | undefined): value is Priority {
  return value === 'first' || value === 'second' || value === 'third'
}

function ClubSelect() {
  const { priority } = useParams()
  const navigate = useNavigate()
  const [, setFirstChoice] = useClientState('')
  const [, setSecondChoice] = useClientState('')
  const [, setThirdChoice] = useClientState('')
  const currentPriority = isPriority(priority) ? priority : 'first'
  const label = priorityLabels[currentPriority]

  const handleSelect = (clubName: string) => {
    if (currentPriority === 'first') {
      setFirstChoice(clubName)
      navigate(`/clubs/questions/${encodeURIComponent(clubName)}`)
      return
    }

    if (currentPriority === 'second') {
      setSecondChoice(clubName)
    } else {
      setThirdChoice(clubName)
    }

    navigate('/clubs')
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Club Selection"
        title={`${label} 동아리 선택`}
        description="동아리 사진, 동아리명, 주요 활동을 확인한 뒤 지원할 동아리를 선택하세요."
      />
      <div className="club-gallery selectable">
        {clubs.map((club, index) => (
          <article className="club-photo-card" key={club.name}>
            <div className="club-photo" style={{ '--club-index': index } as React.CSSProperties}>
              <span>{club.name.slice(0, 2)}</span>
            </div>
            <div>
              <h3>{club.name}</h3>
              <p>{club.activity}</p>
              <button className="primary-button" type="button" onClick={() => handleSelect(club.name)}>
                {label}로 선택
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="notice-card">
        <strong>선택 안내</strong>
        <p>1순위 동아리를 선택하면 해당 동아리 질문 페이지로 이동합니다.</p>
        <Link className="secondary-button" to="/clubs">지원 페이지로 돌아가기</Link>
      </div>
    </section>
  )
}

export default ClubSelect
