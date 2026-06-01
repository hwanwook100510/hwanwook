import type { Timestamp } from 'firebase/firestore'

export type FirestoreTime = Timestamp | string

export type Status = '학생회 내부 논의 중' | '구체화 중' | '선생님과 논의 중' | '허가' | '실행 중' | '완료'
export type PledgeStatus = '선거 중'

export type Member = {
  id: number
  name: string
  role: string
  department: string
  intro: string
}

export type ProgressItem = {
  id: number
  type: '공약' | '학생 제안'
  title: string
  department: string
  status: Status
  updatedAt: string
}

export type PolicySuggestion = {
  id: string
  title: string
  content: string
  effect: string
  createdAt: FirestoreTime
  category: string
  isAnonymous?: boolean
}

export type PolicySuggestionAuthor = {
  suggestionId: string
  authorEmail: string
  authorName: string
}

export type EvaluationResult = {
  promise: number
  communication: number
  event: number
  reflection: number
}

export type ClubApplication = {
  id: string
  email: string
  name: string
  grade: string
  classNumber: string
  number: string
  firstChoice: string
  secondChoice: string
  thirdChoice: string
  questionAnswers?: string[]
  createdAt: FirestoreTime
  locked?: boolean
  unlockedByAdmin?: boolean
}

export type StudentProfile = {
  email: string
  name: string
  grade: string
  classNumber: string
  number: string
  createdAt: FirestoreTime
}

export type ClubRole = '동아리원' | '동아리장'

export type ClubRoleAssignment = {
  email: string
  club: string
  role: ClubRole
  updatedAt: FirestoreTime
}

export type AccountSuspension = {
  email: string
  suspendedAt: FirestoreTime
  suspendedBy: string
}

export type EvaluationResponse = EvaluationResult & {
  email: string
  name: string
  createdAt: FirestoreTime
}

export type VoteRecord = {
  id: string
  email: string
  name: string
  target: string
  choice: string
  createdAt: FirestoreTime
}

export type ElectionResult = {
  id: string
  isClosed: boolean
  closedAt?: FirestoreTime
  totalVotes: number
  counts: Record<string, number>
  percentages: Record<string, number>
  winners: string[]
}

export type PledgeProgress = {
  id: string
  title: string
  description: string
  status: PledgeStatus
  updatedAt: FirestoreTime
}

export type ClubIntro = {
  club: string
  intro: string
  updatedAt: FirestoreTime
}

export type Notice = {
  id: number
  category: string
  title: string
  date: string
  summary: string
}

export type Schedule = {
  id: number
  date: string
  title: string
  target: string
}
