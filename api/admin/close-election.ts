import { adminDb, FieldValue, readBody, requireAdmin, sendJson, writeAuditLog } from '../_lib/firebaseAdmin'
import type { ApiRequest, ApiResponse } from '../_lib/firebaseAdmin'

const electionTarget = '바른생활부 차장 보궐선거'
const electionCandidates = ['신의진', '문소연']
const policyVoteTargets = ['자판기 설치', '전체 잔류일을 활용한 학예제 개최']

function isValidVote(vote: Record<string, unknown>) {
  const target = typeof vote.target === 'string' ? vote.target : ''
  const choice = typeof vote.choice === 'string' ? vote.choice : ''

  if (target === electionTarget) return electionCandidates.includes(choice)
  return policyVoteTargets.includes(target) && ['찬성', '반대'].includes(choice)
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { ok: false })
    return
  }

  try {
    const admin = await requireAdmin(request)
    await readBody(request)
    const voteSnapshot = await adminDb.collection('voteRecords').get()
    const votes = voteSnapshot.docs.map((doc) => doc.data()).filter(isValidVote)
    const counts = votes.reduce<Record<string, number>>((acc, vote) => {
      const target = String(vote.target)
      const choice = String(vote.choice)
      const key = target === electionTarget ? choice : `${target}:${choice}`
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
    const targetTotals = votes.reduce<Record<string, number>>((acc, vote) => {
      const target = String(vote.target)
      acc[target] = (acc[target] ?? 0) + 1
      return acc
    }, {})
    const percentages = votes.reduce<Record<string, number>>((acc, vote) => {
      const target = String(vote.target)
      const choice = String(vote.choice)
      const key = target === electionTarget ? choice : `${target}:${choice}`
      const total = targetTotals[target] ?? 0
      acc[key] = total === 0 ? 0 : ((counts[key] ?? 0) / total) * 100
      return acc
    }, {})
    const maxCandidateVotes = Math.max(0, ...electionCandidates.map((candidate) => counts[candidate] ?? 0))
    const winners = maxCandidateVotes === 0 ? [] : electionCandidates.filter((candidate) => (counts[candidate] ?? 0) === maxCandidateVotes)

    await Promise.all([
      adminDb.doc('electionSettings/current').set({ isClosed: true, closedAt: FieldValue.serverTimestamp() }, { merge: true }),
      adminDb.doc('electionResults/current').set({ id: 'current', isClosed: true, closedAt: FieldValue.serverTimestamp(), totalVotes: votes.length, counts, percentages, winners }),
      writeAuditLog('election_close', admin.uid),
    ])

    sendJson(response, 200, { ok: true })
  } catch {
    sendJson(response, 403, { ok: false, message: '요청을 처리할 권한이 없습니다.' })
  }
}
