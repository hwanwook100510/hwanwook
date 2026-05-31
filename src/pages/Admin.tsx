import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { clubs } from '../data/clubs'
import { db } from '../firebase'
import type { AccountSuspension, ClubApplication, ClubRole, ClubRoleAssignment, EvaluationResponse, FirestoreTime, PledgeProgress, PledgeStatus, PolicySuggestion, PolicySuggestionAuthor, StudentProfile, VoteRecord } from '../types'

const pledgeStatuses: PledgeStatus[] = ['예정', '진행중', '완료', '보류']
const emptyPledgeForm = { id: '', title: '', description: '', status: '예정' as PledgeStatus, progress: '0' }

function formatTime(value: FirestoreTime) {
  if (typeof value === 'string') return value

  return typeof value.toDate === 'function' ? value.toDate().toLocaleString('ko-KR') : '방금'
}

function Admin() {
  const { user, isAdmin } = useAuth()
  const [visibleProfiles, setVisibleProfiles] = useState<StudentProfile[]>([])
  const [visibleAssignments, setVisibleAssignments] = useState<ClubRoleAssignment[]>([])
  const [applications, setApplications] = useState<ClubApplication[]>([])
  const [suspensions, setSuspensions] = useState<AccountSuspension[]>([])
  const [evaluationResponses, setEvaluationResponses] = useState<EvaluationResponse[]>([])
  const [policySuggestions, setPolicySuggestions] = useState<PolicySuggestion[]>([])
  const [suggestionAuthors, setSuggestionAuthors] = useState<PolicySuggestionAuthor[]>([])
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([])
  const [pledges, setPledges] = useState<PledgeProgress[]>([])
  const [pledgeForm, setPledgeForm] = useState(emptyPledgeForm)
  const [message, setMessage] = useState('')
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!db || !isAdmin) {
      return
    }

    async function loadAdminData() {
      setLoadingData(true)

      try {
        const [profileSnapshot, assignmentSnapshot, applicationSnapshot, suspensionSnapshot, evaluationSnapshot, suggestionSnapshot, authorSnapshot, voteSnapshot, pledgeSnapshot] = await Promise.all([
          getDocs(collection(db!, 'studentProfiles')),
          getDocs(collection(db!, 'clubRoleAssignments')),
          getDocs(collection(db!, 'clubApplications')),
          getDocs(collection(db!, 'suspendedUsers')),
          getDocs(collection(db!, 'evaluationResponses')),
          getDocs(collection(db!, 'policySuggestions')),
          getDocs(collection(db!, 'policySuggestionAuthors')),
          getDocs(collection(db!, 'voteRecords')),
          getDocs(collection(db!, 'pledgeProgress')),
        ])
        const remoteProfiles = profileSnapshot.docs.map((item) => item.data() as StudentProfile)
        const remoteAssignments = assignmentSnapshot.docs.map((item) => item.data() as ClubRoleAssignment)
        const remoteApplications = applicationSnapshot.docs.map((item) => item.data() as ClubApplication)
        const remoteSuspensions = suspensionSnapshot.docs.map((item) => item.data() as AccountSuspension)

        setVisibleProfiles(remoteProfiles)
        setVisibleAssignments(remoteAssignments)
        setApplications(remoteApplications)
        setSuspensions(remoteSuspensions)
        setEvaluationResponses(evaluationSnapshot.docs.map((item) => item.data() as EvaluationResponse))
        setPolicySuggestions(suggestionSnapshot.docs.map((item) => item.data() as PolicySuggestion))
        setSuggestionAuthors(authorSnapshot.docs.map((item) => item.data() as PolicySuggestionAuthor))
        setVoteRecords(voteSnapshot.docs.map((item) => item.data() as VoteRecord))
        setPledges(pledgeSnapshot.docs.map((item) => item.data() as PledgeProgress))
      } catch {
        setMessage('DB 데이터를 불러오지 못했습니다. DB 설정과 권한을 확인해주세요.')
      } finally {
        setLoadingData(false)
      }
    }

    void loadAdminData()
  }, [isAdmin, user?.email])

  if (!isAdmin) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Admin" title="접근 권한이 없습니다" description="관리자 계정으로 로그인해야 사용할 수 있는 페이지입니다." />
      </section>
    )
  }

  const updateAssignment = async (email: string, field: 'club' | 'role', value: string) => {
    if (field === 'club' && value && !clubs.some((club) => club.name === value)) {
      setMessage('등록된 동아리만 선택할 수 있습니다.')
      return
    }

    if (field === 'role' && value !== '동아리원' && value !== '동아리장') {
      setMessage('등록된 지위만 선택할 수 있습니다.')
      return
    }

    const current = visibleAssignments.find((assignment) => assignment.email === email)
    const nextAssignment: ClubRoleAssignment = {
      email,
      club: field === 'club' ? value : current?.club ?? clubs[0].name,
      role: field === 'role' ? value as ClubRole : current?.role ?? '동아리원',
      updatedAt: serverTimestamp() as unknown as ClubRoleAssignment['updatedAt'],
    }

    const nextAssignments = [nextAssignment, ...visibleAssignments.filter((assignment) => assignment.email !== email)]

    try {
      await setDoc(doc(db!, 'clubRoleAssignments', email), nextAssignment, { merge: true })
      setVisibleAssignments(nextAssignments)
    } catch {
      setMessage('동아리 권한 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const updateProfile = async (email: string, field: 'grade' | 'classNumber' | 'number' | 'name', value: string) => {
    const current = visibleProfiles.find((profile) => profile.email === email)

    if (!current) return

    const nextProfile = { ...current, [field]: value }
    try {
      await setDoc(doc(db!, 'studentProfiles', email), nextProfile, { merge: true })
      setVisibleProfiles(visibleProfiles.map((profile) => profile.email === email ? nextProfile : profile))
    } catch {
      setMessage('학생 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const unlockApplication = async (email: string) => {
    const current = applications.find((application) => application.email === email)

    if (!current) {
      setMessage('해제할 지원서가 없습니다.')
      return
    }

    const nextApplication = { ...current, locked: false, unlockedByAdmin: true }
    try {
      await setDoc(doc(db!, 'clubApplications', email), nextApplication, { merge: true })
      setApplications(applications.map((application) => application.email === email ? nextApplication : application))
      setMessage(`${email} 지원서 수정을 다시 허용했습니다.`)
    } catch {
      setMessage('지원서 수정 허용 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const suspendAccount = async (email: string) => {
    if (!db) {
      setMessage('DB에 연결할 수 없어 계정을 정지할 수 없습니다.')
      return
    }

    if (user?.email === email) {
      setMessage('관리자 계정은 정지할 수 없습니다.')
      return
    }

    const suspension: AccountSuspension = {
      email,
      suspendedAt: serverTimestamp() as unknown as AccountSuspension['suspendedAt'],
      suspendedBy: user?.email ?? 'admin',
    }

    try {
      await setDoc(doc(db, 'suspendedUsers', email), suspension, { merge: true })
      setSuspensions([suspension, ...suspensions.filter((item) => item.email !== email)])
      setMessage(`${email} 계정을 정지했습니다.`)
    } catch {
      setMessage('계정 정지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const restoreAccount = async (email: string) => {
    if (!db) {
      setMessage('DB에 연결할 수 없어 계정 정지를 해제할 수 없습니다.')
      return
    }

    try {
      await deleteDoc(doc(db, 'suspendedUsers', email))
      setSuspensions(suspensions.filter((item) => item.email !== email))
      setMessage(`${email} 계정 정지를 해제했습니다.`)
    } catch {
      setMessage('계정 정지 해제에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const savePledge = async () => {
    if (!db) { setMessage('DB에 연결할 수 없어 공약을 저장할 수 없습니다.'); return }

    const title = pledgeForm.title.trim()
    const description = pledgeForm.description.trim()
    const progress = Number(pledgeForm.progress)

    if (!title || !description || Number.isNaN(progress) || progress < 0 || progress > 100) {
      setMessage('공약 제목, 설명, 0~100 사이 진행률을 입력해주세요.')
      return
    }

    const pledgeRef = pledgeForm.id ? doc(db, 'pledgeProgress', pledgeForm.id) : doc(collection(db, 'pledgeProgress'))
    const pledge: PledgeProgress = {
      id: pledgeRef.id,
      title,
      description,
      status: pledgeForm.status,
      progress,
      updatedAt: serverTimestamp() as unknown as PledgeProgress['updatedAt'],
    }

    try {
      await setDoc(pledgeRef, pledge)
      setPledges([pledge, ...pledges.filter((item) => item.id !== pledge.id)])
      setPledgeForm(emptyPledgeForm)
      setMessage('공약 진행 현황을 저장했습니다.')
    } catch {
      setMessage('공약 진행 현황 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const editPledge = (pledge: PledgeProgress) => {
    setPledgeForm({ id: pledge.id, title: pledge.title, description: pledge.description, status: pledge.status, progress: String(pledge.progress) })
  }

  const removePledge = async (id: string) => {
    if (!db) { setMessage('DB에 연결할 수 없어 공약을 삭제할 수 없습니다.'); return }

    try {
      await deleteDoc(doc(db, 'pledgeProgress', id))
      setPledges(pledges.filter((item) => item.id !== id))
      setMessage('공약 진행 현황을 삭제했습니다.')
    } catch {
      setMessage('공약 진행 현황 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Admin"
        title="회원 및 동아리 권한 관리"
        description="회원가입한 학생 명단을 확인하고 동아리원 또는 동아리장 권한을 부여합니다."
      />
      {message && <p className="success-message">{message}</p>}
      {loadingData && <p className="success-message">관리 데이터를 불러오는 중입니다.</p>}
      <div className="admin-list">
        {visibleProfiles.length === 0 ? <p>아직 회원가입한 학생이 없습니다.</p> : visibleProfiles.map((profile) => {
          const assignment = visibleAssignments.find((item) => item.email === profile.email)
          const isSuspended = suspensions.some((item) => item.email === profile.email)
          const application = applications.find((item) => item.email === profile.email)

          return (
            <article className="admin-row" key={profile.email}>
              <div>
                <strong>{profile.name}</strong>
                <span>{profile.grade}학년 {profile.classNumber}반 {profile.number}번 · {profile.email}</span>
              </div>
              <label><span>학년</span><select value={profile.grade} onChange={(event) => updateProfile(profile.email, 'grade', event.target.value)}><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select></label>
              <label><span>반</span><input value={profile.classNumber} onChange={(event) => updateProfile(profile.email, 'classNumber', event.target.value)} /></label>
              <label><span>번호</span><input value={profile.number} onChange={(event) => updateProfile(profile.email, 'number', event.target.value)} /></label>
              <label><span>이름</span><input value={profile.name} onChange={(event) => updateProfile(profile.email, 'name', event.target.value)} /></label>
              <label>
                <span>동아리</span>
                <select value={assignment?.club ?? ''} onChange={(event) => updateAssignment(profile.email, 'club', event.target.value)}>
                  <option value="">동아리 선택</option>
                  {clubs.map((club) => <option key={club.name} value={club.name}>{club.name}</option>)}
                </select>
              </label>
              <label>
                <span>지위</span>
                <select value={assignment?.role ?? '동아리원'} onChange={(event) => updateAssignment(profile.email, 'role', event.target.value)}>
                  <option>동아리원</option>
                  <option>동아리장</option>
                </select>
              </label>
              {isSuspended
                ? <button className="secondary-button" type="button" onClick={() => restoreAccount(profile.email)}>정지 해제</button>
                : <button className="primary-button" type="button" onClick={() => suspendAccount(profile.email)}>계정 정지</button>}
              {application && <button className="secondary-button" type="button" onClick={() => unlockApplication(profile.email)}>지원서 수정 허용</button>}
            </article>
          )
        })}
      </div>
      <section className="content-section">
        <SectionHeader title="학생회 평가 조회" description="기존에 저장된 평가 응답은 관리자만 확인할 수 있습니다." />
        <div className="admin-list">
          {evaluationResponses.length === 0 ? <p>저장된 평가 응답이 없습니다.</p> : evaluationResponses.map((response) => (
            <article className="admin-row" key={response.email}>
              <div>
                <strong>{response.name}</strong>
                <span>{response.email} · {formatTime(response.createdAt)}</span>
              </div>
              <span>공약 {response.promise} · 소통 {response.communication} · 행사 {response.event} · 복지 {response.reflection}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section">
        <SectionHeader title="정책 제안 조회" description="정책 제안 내용과 작성자 정보는 관리자만 함께 확인할 수 있습니다." />
        <div className="admin-list">
          {policySuggestions.length === 0 ? <p>저장된 정책 제안이 없습니다.</p> : policySuggestions.map((suggestion) => {
            const author = suggestionAuthors.find((item) => item.suggestionId === suggestion.id)

            return (
              <article className="admin-row" key={suggestion.id}>
                <div>
                  <strong>{suggestion.title}</strong>
                  <span>{suggestion.category} · {formatTime(suggestion.createdAt)}</span>
                  <p>{suggestion.content}</p>
                  <p>기대 효과: {suggestion.effect}</p>
                </div>
                <span>{author ? `${author.authorName} · ${author.authorEmail}` : '작성자 정보 없음'}</span>
              </article>
            )
          })}
        </div>
      </section>
      <section className="content-section">
        <SectionHeader title="투표 기록 조회" description="저장된 투표 기록은 관리자만 확인할 수 있습니다." />
        <div className="admin-list">
          {voteRecords.length === 0 ? <p>저장된 투표 기록이 없습니다.</p> : voteRecords.map((vote) => (
            <article className="admin-row" key={vote.id}>
              <div>
                <strong>{vote.target}</strong>
                <span>{vote.choice} · {formatTime(vote.createdAt)}</span>
              </div>
              <span>{vote.name} · {vote.email}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section">
        <SectionHeader title="공약 진행 현황 관리" description="공개 공약 진행 현황을 추가, 수정, 삭제합니다." />
        <div className="two-column">
          <div className="form-card">
            <h3>{pledgeForm.id ? '공약 수정' : '공약 추가'}</h3>
            <label><span>제목</span><input value={pledgeForm.title} onChange={(event) => setPledgeForm({ ...pledgeForm, title: event.target.value })} /></label>
            <label><span>설명</span><textarea rows={4} value={pledgeForm.description} onChange={(event) => setPledgeForm({ ...pledgeForm, description: event.target.value })} /></label>
            <label><span>상태</span><select value={pledgeForm.status} onChange={(event) => setPledgeForm({ ...pledgeForm, status: event.target.value as PledgeStatus })}>{pledgeStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label><span>진행률</span><input inputMode="numeric" value={pledgeForm.progress} onChange={(event) => setPledgeForm({ ...pledgeForm, progress: event.target.value })} /></label>
            <button className="primary-button" type="button" onClick={savePledge}>저장</button>
            {pledgeForm.id && <button className="secondary-button" type="button" onClick={() => setPledgeForm(emptyPledgeForm)}>취소</button>}
          </div>
          <div className="admin-list">
            {pledges.length === 0 ? <p>등록된 공약이 없습니다.</p> : pledges.map((pledge) => (
              <article className="admin-row" key={pledge.id}>
                <div>
                  <strong>{pledge.title}</strong>
                  <span>{pledge.status} · {pledge.progress}% · {formatTime(pledge.updatedAt)}</span>
                  <p>{pledge.description}</p>
                </div>
                <button className="secondary-button" type="button" onClick={() => editPledge(pledge)}>수정</button>
                <button className="primary-button" type="button" onClick={() => removePledge(pledge.id)}>삭제</button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  )
}

export default Admin
