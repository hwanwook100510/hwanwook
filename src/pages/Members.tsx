import { Link } from 'react-router-dom'
import { members } from '../data/mockData'

const departments = Array.from(new Set(members.map((member) => member.department))).filter((department) => department !== '회장단')
const values = [
  { icon: 'flag', title: '우리의 비전', text: '학생의 목소리가 학교를 변화시키고, 모두가 행복한 학교를 만듭니다.' },
  { icon: 'flag', title: '우리의 미션', text: '소통과 참여를 바탕으로 학생 중심의 학교 문화를 실현합니다.' },
  { icon: 'users', title: '핵심 가치', text: '소통과 공감, 책임감과 신뢰, 도전과 혁신, 함께하는 성장' },
  { icon: 'check', title: '학생회가 하는 일', text: '의견 수렴, 정책 제안, 행사 기획, 학생 복지와 권익 증진' },
]
const officers = [
  { role: '회장', name: '박동우', image: '/president.jpg' },
  { role: '부회장', name: '정환욱', image: '/vice-president.jpg' },
]

function Icon({ name }: { name: string }) {
  return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg>
}

function Members() {
  return (
    <div className="design-page members-design">
      <section className="design-hero">
        <div>
          <small>홈 &gt; 학생회 소개</small>
          <h1>함께 만드는 더 나은<br /><span>디미고</span></h1>
          <p>디미고등학교 학생회의 비전과 활동을 소개합니다.</p>
          <p>학생 한 사람, 한 사람의 목소리가 모여 더 나은 학교를 만들어갑니다.</p>
        </div>
      </section>

      <section className="design-wide two-main">
        <div>
          <div className="design-title"><h2>우리의 비전과 가치</h2></div>
          <div className="value-grid">
            {values.map((item) => (
              <article className="design-card value-card" key={item.title}>
                <span><Icon name={item.icon} /></span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <div className="design-title"><h2>2026-27학년도 회장단 후보</h2><Link to="/members">전체 보기</Link></div>
          <div className="officer-grid">
            {officers.map((officer) => (
              <article className="design-card officer-card" key={officer.role}>
                <b>{officer.role}</b>
                <img className="officer-photo" src={officer.image} alt={`${officer.name} ${officer.role}`} />
                <strong>{officer.name}</strong>
                <p>사진과 소개는 추후 등록됩니다.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="design-wide department-section">
        <div className="design-title"><h2>부서 소개</h2></div>
        <div className="department-grid">
          {departments.map((department) => (
            <article className="design-card department-empty-card" key={department}>
              <h3>{department}</h3>
              {(department === '회장단' ? ['회장', '부회장'] : ['부장', '차장']).map((role) => (
                <div className="department-role-card" key={role}>
                  <div className="empty-photo">공석</div>
                  <span>{role}</span>
                  <strong>공석</strong>
                  <p>사진과 소개는 추후 등록됩니다.</p>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="design-wide bottom-panels">
        <article className="design-card">
          <div className="design-title"><h2>주요 활동 소개</h2><Link to="/suggestions">더보기</Link></div>
          <div className="activity-grid activity-grid-empty" aria-hidden="true" />
        </article>
        <article className="design-card achievement-card">
          <div className="design-title"><h2>주요 성과</h2><Link to="/progress">더보기</Link></div>
          <div className="metric-grid"><div><Icon name="users" /><strong>0</strong><span>정책 제안</span></div><div><Icon name="clipboard" /><strong>0</strong><span>정책 실현</span></div><div><Icon name="megaphone" /><strong>0</strong><span>행사 진행</span></div><div><Icon name="check" /><strong>0</strong><span>참여 인원</span></div></div>
        </article>
      </section>
    </div>
  )
}

export default Members
