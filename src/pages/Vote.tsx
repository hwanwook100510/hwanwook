import { Link } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'

const candidates = [
  { name: '신의진', slogan: '존중과 책임으로 만드는 바른생활부!' },
  { name: '문소연', slogan: '실천과 소통으로 함께하는 바른생활부!' },
]
const policyVotes = [
  { title: '자판기 설치', desc: '학생 편의를 위한 교내 자판기 설치 추진에 대한 의견을 묻습니다.', yes: 0, no: 0 },
  { title: '전체 잔류일을 활용한 학예제 개최', desc: '전체 잔류일을 활용한 학예제 개최 추진에 대한 의견을 묻습니다.', yes: 0, no: 0 },
]
const totalStudents = 540
const totalParticipants = 0

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }

function Vote() {
  const [votes, setVotes] = useLocalStorage<Record<string, string>>('dimigo-votes', {})
  const [candidate, setCandidate] = useLocalStorage('dimigo-election-vote', '')
  const [viewingCandidate, setViewingCandidate] = useLocalStorage('dimigo-viewing-candidate', '')

  const savePolicyVote = (title: string, value: '찬성' | '반대') => {
    setVotes({ ...votes, [title]: value })
  }

  return (
    <div className="design-page vote-page">
      <section className="design-hero compact"><div><h1>학생회 투표</h1><p>제안된 학생회 정책에 찬반 의사를 표현하고, 학생회 보궐선거에 참여하여 우리 학교의 미래를 함께 만들어 주세요.</p></div></section>
      <section className="design-wide stat-grid four"><article><Icon name="vote" /><b>진행 중 투표</b><strong>3건</strong><span>정책 2건 · 선거 1건</span></article><article><Icon name="check" /><b>정책 찬반 투표</b><strong>2건</strong><span>참여 가능한 정책 투표</span></article><article><Icon name="users" /><b>보궐선거 후보</b><strong>1명</strong><span>바른생활부 차장 보궐선거</span></article><article><Icon name="users" /><b>총 참여 학생</b><strong>{totalParticipants.toLocaleString()}명</strong><span>전체 재학생 {totalStudents.toLocaleString()}명</span></article></section>
      <section className="design-wide vote-layout">
        <div>
          <article className="design-card vote-list-card" id="policy-vote"><div className="design-title"><h2>정책 찬반 투표</h2><Link to="/suggestions">전체 보기</Link></div>{policyVotes.map((item) => <div className="vote-item" key={item.title}><span className="round-icon"><Icon name="vote" /></span><div><h3>{item.title}</h3><p>{item.desc}</p></div><div className="vote-period"><b>투표 기간</b><span>추후 안내</span><small>참여자 0명</small></div><div className="vote-result"><p>찬성 <i><b style={{ width: `${item.yes}%` }} /></i> {item.yes}%</p><p>반대 <i><b style={{ width: `${item.no}%` }} /></i> {item.no}%</p></div><div><button type="button" onClick={() => savePolicyVote(item.title, '찬성')}>찬성</button><button className="outline" type="button" onClick={() => savePolicyVote(item.title, '반대')}>반대</button>{votes[item.title] && <small>내 선택: {votes[item.title]}</small>}</div></div>)}</article>
        </div>
        <article className="design-card election-card" id="election-vote"><h2>바른생활부 차장 보궐선거</h2><p>바른생활부 차장 후보를 선택해 주세요.</p><div className="candidate-grid">{candidates.map((item, index) => <div className="candidate" key={item.name}><b>{index + 1}</b><div className="empty-photo">공석</div><strong>{item.name}</strong><span>바른생활부 차장 후보</span><p>{item.slogan}</p><button className={viewingCandidate === item.name ? 'selected' : ''} type="button" onClick={() => setViewingCandidate(item.name)}>후보 선택</button></div>)}</div><button className="design-primary" type="button" onClick={() => setCandidate(viewingCandidate || candidates[0].name)}>보궐선거 투표 참여하기</button>{candidate && <p className="success-message">{candidate} 후보에게 투표했습니다.</p>}</article>
        <aside className="design-card vote-side"><h2>선거 안내</h2>{['선거 일정 05.20 ~ 05.27', '투표 방법 온라인 투표', '투표 자격 우리학교 재학생 전체', '투표 인증 학생 인증 후 참여'].map((item) => <p key={item}><Icon name="check" />{item}</p>)}<h2>최근 종료된 투표</h2>{[0, 1, 2].map((item) => <div className="side-empty-row" key={item} aria-hidden="true" />)}</aside>
      </section>
    </div>
  )
}

export default Vote
