import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { clubs } from '../data/clubs'
import { db } from '../firebase'
import type { ClubApplication, ClubIntro, ClubRoleAssignment } from '../types'

function getPriority(application: ClubApplication, club: string) {
  if (application.firstChoice === club) return '1순위'
  if (application.secondChoice === club) return '2순위'
  if (application.thirdChoice === club) return '3순위'
  return ''
}

function formatDate(value: ClubApplication['createdAt']) {
  if (typeof value === 'string') return value

  return typeof value.toDate === 'function' ? value.toDate().toISOString().slice(0, 10) : '방금'
}

function ClubDashboard() {
  const { user } = useAuth()
  const userEmail = user?.email
  const [remoteAssignments, setRemoteAssignments] = useState<ClubRoleAssignment[]>([])
  const [remoteApplications, setRemoteApplications] = useState<ClubApplication[]>([])
  const [remoteIntros, setRemoteIntros] = useState<ClubIntro[]>([])
  const assignment = remoteAssignments.find((item) => item.email === userEmail)
  const club = clubs.find((item) => item.name === assignment?.club)
  const savedIntro = remoteIntros.find((intro) => intro.club === assignment?.club)
  const [intro, setIntro] = useState(savedIntro?.intro ?? '')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!db || !userEmail) {
      return
    }

    async function loadClubData() {
      const assignmentSnapshot = await getDoc(doc(db!, 'clubRoleAssignments', userEmail!))

      if (!assignmentSnapshot.exists()) {
        setRemoteAssignments([])
        setRemoteApplications([])
        setRemoteIntros([])
        return
      }

      const loadedAssignment = assignmentSnapshot.data() as ClubRoleAssignment
      const assignedClub = clubs.find((item) => item.name === loadedAssignment.club)

      if (!assignedClub) {
        setRemoteAssignments([])
        setRemoteApplications([])
        setRemoteIntros([])
        return
      }

      let loadedApplications: ClubApplication[] = []

      if (loadedAssignment.role === '동아리장') {
        const [firstChoiceSnapshot, secondChoiceSnapshot, thirdChoiceSnapshot] = await Promise.all([
          getDocs(query(collection(db!, 'clubApplications'), where('firstChoice', '==', assignedClub.name))),
          getDocs(query(collection(db!, 'clubApplications'), where('secondChoice', '==', assignedClub.name))),
          getDocs(query(collection(db!, 'clubApplications'), where('thirdChoice', '==', assignedClub.name))),
        ])

        const applicationMap = new Map<string, ClubApplication>()
        ;[firstChoiceSnapshot, secondChoiceSnapshot, thirdChoiceSnapshot].forEach((snapshot) => {
          snapshot.docs.forEach((item) => {
            const application = item.data() as ClubApplication
            applicationMap.set(application.id, application)
          })
        })

        loadedApplications = Array.from(applicationMap.values())
      }

      const introSnapshot = await getDoc(doc(db!, 'clubIntros', assignedClub.name))
      const loadedIntro = introSnapshot.exists() ? introSnapshot.data() as ClubIntro : null

      setRemoteAssignments([loadedAssignment])
      setRemoteApplications(loadedApplications)
      setRemoteIntros(loadedIntro ? [loadedIntro] : [])

      if (loadedIntro) {
        setIntro(loadedIntro.intro)
      }
    }

    void loadClubData()
  }, [userEmail])

  if (!assignment || !club) {
    return (
      <section className="page-section">
        <SectionHeader
          eyebrow="Club Management"
          title="동아리 권한이 없습니다"
          description="관리자가 동아리원 또는 동아리장 지위를 부여하면 이 페이지에서 지원서를 볼 수 있습니다."
        />
      </section>
    )
  }

  const clubApplications = remoteApplications.filter((application) => getPriority(application, club.name))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextIntro: ClubIntro = {
      club: club.name,
      intro: intro.trim(),
      updatedAt: serverTimestamp() as unknown as ClubIntro['updatedAt'],
    }

    const nextIntros = [nextIntro, ...remoteIntros.filter((item) => item.club !== club.name)]

    if (!db) { setMessage('DB에 연결할 수 없어 동아리 소개글을 저장하지 못했습니다.'); return }

    try {
      await setDoc(doc(db, 'clubIntros', club.name), nextIntro, { merge: true })
      setRemoteIntros(nextIntros)
      setMessage('동아리 소개글이 저장되었습니다.')
    } catch {
      setMessage('동아리 소개글 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const assignClubMember = async (email: string) => {
    if (!club || assignment?.role !== '동아리장') return

    const nextAssignment: ClubRoleAssignment = {
      email,
      club: club.name,
      role: '동아리원',
      updatedAt: serverTimestamp() as unknown as ClubRoleAssignment['updatedAt'],
    }

    if (!db) { setMessage('DB에 연결할 수 없어 동아리원 권한을 저장하지 못했습니다.'); return }

    try {
      await setDoc(doc(db, 'clubRoleAssignments', email), nextAssignment, { merge: true })
      setRemoteAssignments([nextAssignment, ...remoteAssignments.filter((item) => item.email !== email)])
      setMessage(`${email} 학생에게 ${club.name} 동아리원 권한을 부여했습니다.`)
    } catch {
      setMessage('동아리원 권한 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Club Management"
        title={`${club.name} 관리`}
        description={`${assignment.role} 권한으로 동아리 소개와 지원 현황을 확인합니다.`}
      />
      <div className="two-column">
        <div className="panel-card">
          <h3>{club.name}</h3>
          <p>{club.activity}</p>
          <div className="student-summary large">
            <span>내 지위</span>
            <strong>{assignment.role}</strong>
          </div>
          <h3>현재 소개글</h3>
          <p>{savedIntro?.intro || '아직 등록된 소개글이 없습니다.'}</p>
        </div>
        {assignment.role === '동아리장' ? (
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>동아리 소개글 수정</h3>
            <label>
              <span>소개글</span>
              <textarea rows={8} maxLength={1500} value={intro} onChange={(event) => setIntro(event.target.value)} placeholder="동아리 소개글을 작성하세요." />
            </label>
            <button className="primary-button" type="submit">소개글 저장</button>
          </form>
        ) : (
          <div className="form-card">
            <h3>동아리원 권한</h3>
            <p>동아리원은 소개글만 확인할 수 있고, 지원서 개인정보 열람과 소개글 수정은 동아리장만 할 수 있습니다.</p>
          </div>
        )}
      </div>
      <section className="content-section">
        <SectionHeader title="우리 동아리 지원서" description="동아리장만 지원자 개인정보와 지원 현황을 확인할 수 있습니다." />
        {message && <p className="success-message">{message}</p>}
        <div className="admin-list">
          {clubApplications.length === 0 ? <p>아직 이 동아리에 들어온 지원서가 없습니다.</p> : clubApplications.map((application) => (
            <article className="admin-row" key={application.id}>
              <div>
                <strong>{application.name}</strong>
                <span>{application.grade}학년 {application.classNumber}반 {application.number}번 · {getPriority(application, club.name)} · {formatDate(application.createdAt)}</span>
              </div>
              <ol className="choice-list">
                <li>1순위: {application.firstChoice}</li>
                <li>2순위: {application.secondChoice}</li>
                <li>3순위: {application.thirdChoice}</li>
              </ol>
              {assignment.role === '동아리장' && <button className="secondary-button" type="button" onClick={() => assignClubMember(application.email)}>동아리원 권한 부여</button>}
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default ClubDashboard
