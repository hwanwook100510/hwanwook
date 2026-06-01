import { useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { db } from '../firebase'
import type { ElectionResult, VoteRecord } from '../types'

const candidates = [
  { name: '신의진', slogan: '존중과 책임으로 만드는 바른생활부!' },
  { name: '문소연', slogan: '실천과 소통으로 함께하는 바른생활부!' },
]
const policyVotes = [
  { title: '자판기 설치', desc: '학생 편의를 위한 교내 자판기 설치 추진에 대한 의견을 묻습니다.' },
  { title: '전체 잔류일을 활용한 학예제 개최', desc: '전체 잔류일을 활용한 학예제 개최 추진에 대한 의견을 묻습니다.' },
]
const electionTarget = '바른생활부 차장 보궐선거'
const electionId = 'current'

function Icon({ name }: { name: string }) { return <svg className="home-icon" aria-hidden="true"><use href={`/icons.svg#${name}`} /></svg> }
function voteId(uid: string, target: string) { return `${electionId}_${uid}_${target}` }

function Vote() {
  const { user, isAdmin, loginWithGoogle } = useAuth()
  const { profile, loading: profileLoading } = useStudentProfile()
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [submittedTargets, setSubmittedTargets] = useState<Record<string, string>>({})
  const [isClosed, setIsClosed] = useState(false)
  const [result, setResult] = useState<ElectionResult | null>(null)
  const [message, setMessage] = useState('')
  const [dbError, setDbError] = useState(db ? '' : 'DB에 연결할 수 없어 투표 정보를 불러올 수 없습니다.')

  useEffect(() => {
    if (!db) {
      return
    }

    async function loadVoteData() {
      try {
        const statusSnapshot = await getDoc(doc(db!, 'electionSettings', 'current'))
        const closed = statusSnapshot.exists() && statusSnapshot.data().isClosed === true
        setIsClosed(closed)

        if (closed) {
          const resultSnapshot = await getDoc(doc(db!, 'electionResults', 'current'))
          if (resultSnapshot.exists()) setResult(resultSnapshot.data() as ElectionResult)
        }

        if (user?.uid) {
          const targets = [...policyVotes.map((item) => item.title), electionTarget]
          const snapshots = await Promise.all(targets.map((target) => getDoc(doc(db!, 'voteRecords', voteId(user.uid, target)))))
          const submitted = snapshots.reduce<Record<string, string>>((acc, snapshot, index) => {
            if (snapshot.exists()) acc[targets[index]] = (snapshot.data() as VoteRecord).choice
            return acc
          }, {})
          setSubmittedTargets(submitted)
        }
      } catch {
        setDbError('DB 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    void loadVoteData()
  }, [user?.uid])

  const submitVote = async (target: string, choice: string) => {
    if (!db) { setMessage('DB에 연결할 수 없어 투표할 수 없습니다.'); return }
    if (!user?.email) { setMessage('로그인 후 투표할 수 있습니다.'); return }
    if (profileLoading) { setMessage('학생 정보를 확인하는 중입니다. 잠시 후 다시 시도해주세요.'); return }
    if (!profile) { setMessage('회원가입 정보를 먼저 등록해주세요.'); return }
    if (isAdmin) { setMessage('관리자는 투표할 수 없습니다. 관리자 페이지에서 조회만 가능합니다.'); return }
    if (isClosed) { setMessage('종료된 투표에는 참여할 수 없습니다.'); return }
    if (submittedTargets[target]) { setMessage('이미 해당 투표에 참여했습니다. 투표는 한 번만 가능합니다.'); return }

    const id = voteId(user.uid, target)
    const vote: VoteRecord = {
      id,
      uid: user.uid,
      electionId,
      email: user.email,
      name: profile.name,
      target,
      choice,
      createdAt: serverTimestamp() as unknown as VoteRecord['createdAt'],
    }

    try {
      await setDoc(doc(db, 'voteRecords', id), vote)
      setSubmittedTargets({ ...submittedTargets, [target]: choice })
      setMessage('투표를 제출했습니다.')
    } catch {
      setMessage('투표 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const totalBallots = result?.totalVotes ?? Object.keys(submittedTargets).length
  const canVote = Boolean(user && profile && !isAdmin && !isClosed)

  return (
    <div className="design-page vote-page">
      <section className="design-hero compact"><div><h1>학생회 투표</h1><p>제안된 학생회 정책에 찬반 의사를 표현하고, 학생회 보궐선거에 참여하여 우리 학교의 미래를 함께 만들어 주세요.</p>{!user && <button className="design-primary" type="button" onClick={loginWithGoogle}>Google로 로그인</button>}</div></section>
      {dbError && <section className="design-wide"><p className="success-message">{dbError}</p></section>}
      {message && <section className="design-wide"><p className="success-message">{message}</p></section>}
      {user && !isAdmin && !profile && <section className="design-wide"><Link className="design-primary" to="/register">회원가입 후 투표하기</Link></section>}
      <section className="design-wide stat-grid four"><article><Icon name="vote" /><b>진행 중 투표</b><strong>{isClosed ? '종료' : '3건'}</strong><span>정책 2건 · 선거 1건</span></article><article><Icon name="check" /><b>정책 찬반 투표</b><strong>2건</strong><span>참여 가능한 정책 투표</span></article><article><Icon name="users" /><b>보궐선거 후보</b><strong>{candidates.length}명</strong><span>바른생활부 차장 보궐선거</span></article><article><Icon name="users" /><b>{isClosed ? '총 투표' : '나의 참여'}</b><strong>{totalBallots.toLocaleString()}건</strong><span>학생 1인 안건별 1회</span></article></section>
      {isAdmin && <section className="design-wide"><p className="success-message">관리자는 투표할 수 없습니다. 관리자 페이지에서 기록 조회와 종료 관리를 진행해주세요.</p></section>}
      <section className="design-wide vote-layout">
        <div>
          <article className="design-card vote-list-card" id="policy-vote"><div className="design-title"><h2>정책 찬반 투표</h2><Link to="/suggestions">전체 보기</Link></div>{policyVotes.map((item) => <div className="vote-item" key={item.title}><span className="round-icon"><Icon name="vote" /></span><div><h3>{item.title}</h3><p>{item.desc}</p>{submittedTargets[item.title] && <small>내 선택: {submittedTargets[item.title]}</small>}</div><div className="vote-period"><b>투표 상태</b><span>{isClosed ? '종료' : '진행 중'}</span><small>학생 1인 1회</small></div>{isClosed && result ? <div className="vote-result"><p>찬성 <i><b style={{ width: `${result.percentages[item.title + ':찬성'] ?? 0}%` }} /></i> {(result.percentages[item.title + ':찬성'] ?? 0).toFixed(1)}%</p><p>반대 <i><b style={{ width: `${result.percentages[item.title + ':반대'] ?? 0}%` }} /></i> {(result.percentages[item.title + ':반대'] ?? 0).toFixed(1)}%</p></div> : <div className="vote-result"><p>투표 결과는 종료 후 공개됩니다.</p></div>}<div><button type="button" disabled={!canVote || Boolean(submittedTargets[item.title])} onClick={() => submitVote(item.title, '찬성')}>찬성</button><button className="outline" type="button" disabled={!canVote || Boolean(submittedTargets[item.title])} onClick={() => submitVote(item.title, '반대')}>반대</button></div></div>)}</article>
        </div>
        <article className="design-card election-card" id="election-vote"><h2>{electionTarget}</h2><p>{isClosed ? '투표가 종료되었습니다.' : '후보를 선택한 뒤 투표를 제출해주세요.'}</p><div className="candidate-grid">{candidates.map((item, index) => <div className="candidate" key={item.name}><b>{index + 1}</b><div className="empty-photo">후보</div><strong>{item.name}</strong><span>바른생활부 차장 후보</span><p>{item.slogan}</p>{isClosed && result ? <small>{result.counts[item.name] ?? 0}표 · {(result.percentages[item.name] ?? 0).toFixed(1)}%</small> : <button className={selectedCandidate === item.name ? 'selected' : ''} type="button" disabled={!canVote || Boolean(submittedTargets[electionTarget])} onClick={() => setSelectedCandidate(item.name)}>후보 선택</button>}</div>)}</div><button className="design-primary" type="button" disabled={!canVote || !selectedCandidate || Boolean(submittedTargets[electionTarget])} onClick={() => submitVote(electionTarget, selectedCandidate)}>보궐선거 투표 제출</button>{submittedTargets[electionTarget] && <p className="success-message">내 선택: {submittedTargets[electionTarget]}</p>}{isClosed && result && <p className="success-message">당선자: {result.winners.length > 0 ? result.winners.join(', ') : '없음'}</p>}</article>
      </section>
    </div>
  )
}

export default Vote
