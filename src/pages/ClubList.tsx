import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { clubs } from '../data/clubs'

function ClubList() {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Club Directory"
        title="동아리 소개"
        description="동아리 사진, 동아리명, 주요 활동을 확인한 뒤 지원할 동아리를 선택하세요."
      />
      <div className="club-gallery">
        {clubs.map((club, index) => (
          <article className="club-photo-card" key={club.name}>
            <div className="club-photo" style={{ '--club-index': index } as React.CSSProperties}>
              <span>{club.name.slice(0, 2)}</span>
            </div>
            <div>
              <h3>{club.name}</h3>
              <p>{club.activity}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="notice-card">
        <strong>지원 안내</strong>
        <p>동아리를 확인했다면 동아리 지원 페이지에서 1순위, 2순위, 3순위를 선택해주세요.</p>
        <Link className="secondary-button" to="/clubs">동아리 지원하러 가기</Link>
      </div>
    </section>
  )
}

export default ClubList
