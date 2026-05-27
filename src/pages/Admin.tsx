import { useEffect, useState } from 'react'
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../contexts/useAuth'
import { clubs } from '../data/clubs'
import { db } from '../firebase'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { ClubRole, ClubRoleAssignment, StudentProfile } from '../types'
import { isAdminEmail } from '../utils/permissions'

function mergeProfiles(remoteProfiles: StudentProfile[], localProfiles: StudentProfile[]) {
  const profileMap = new Map<string, StudentProfile>()

  localProfiles.forEach((profile) => profileMap.set(profile.email, profile))
  remoteProfiles.forEach((profile) => profileMap.set(profile.email, profile))

  return Array.from(profileMap.values())
}

function Admin() {
  const { user } = useAuth()
  const [profiles] = useLocalStorage<StudentProfile[]>('dimigo-student-profiles', [])
  const [assignments, setAssignments] = useLocalStorage<ClubRoleAssignment[]>('dimigo-club-role-assignments', [])
  const [visibleProfiles, setVisibleProfiles] = useState<StudentProfile[]>(profiles)
  const [visibleAssignments, setVisibleAssignments] = useState<ClubRoleAssignment[]>(assignments)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!db || !isAdminEmail(user?.email)) {
      return
    }

    async function loadAdminData() {
      try {
        const [profileSnapshot, assignmentSnapshot] = await Promise.all([
          getDocs(collection(db!, 'studentProfiles')),
          getDocs(collection(db!, 'clubRoleAssignments')),
        ])
        const remoteProfiles = profileSnapshot.docs.map((item) => item.data() as StudentProfile)
        const remoteAssignments = assignmentSnapshot.docs.map((item) => item.data() as ClubRoleAssignment)

        setVisibleProfiles(mergeProfiles(remoteProfiles, profiles))
        setVisibleAssignments(remoteAssignments)
        setAssignments(remoteAssignments)
      } catch {
        setMessage('Firestore 데이터를 불러오지 못했습니다. Firebase Console에서 Firestore Database를 활성화했는지 확인해주세요.')
      }
    }

    void loadAdminData()
  }, [profiles, setAssignments, user?.email])

  if (!isAdminEmail(user?.email)) {
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
      updatedAt: new Date().toISOString().slice(0, 10),
    }

    const nextAssignments = [nextAssignment, ...visibleAssignments.filter((assignment) => assignment.email !== email)]
    setVisibleAssignments(nextAssignments)
    setAssignments(nextAssignments)

    if (db) {
      await setDoc(doc(db, 'clubRoleAssignments', email), nextAssignment, { merge: true })
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
      <div className="admin-list">
        {visibleProfiles.length === 0 ? <p>아직 회원가입한 학생이 없습니다.</p> : visibleProfiles.map((profile) => {
          const assignment = visibleAssignments.find((item) => item.email === profile.email)

          return (
            <article className="admin-row" key={profile.email}>
              <div>
                <strong>{profile.name}</strong>
                <span>{profile.grade}학년 {profile.classNumber}반 {profile.number}번 · {profile.email}</span>
              </div>
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
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Admin
