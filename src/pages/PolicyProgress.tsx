import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import { progressItems } from '../data/mockData'

const pledgeStages = ['학생회 내부 논의 중', '구체화 중', '선생님과 논의 중', '허가', '실행 중', '완료'] as const

function PolicyProgress() {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Open Progress"
        title="공약 및 정책 제안 진행 현황"
        description="공약과 학생 제안의 담당 부서, 현재 단계, 최근 업데이트 날짜를 공개합니다."
      />
      <div className="stage-guide" aria-label="공약 이행 단계">
        {pledgeStages.map((stage, index) => (
          <div className="stage-step" key={stage}>
            <span className="stage-number">{index + 1}</span>
            <div>
              <small>STEP {index + 1}</small>
              <strong>{stage}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="progress-table" role="table" aria-label="공약 및 정책 진행 현황">
        <div className="table-row table-head" role="row">
          <span>구분</span>
          <span>제목</span>
          <span>담당 부서</span>
          <span>현재 단계</span>
          <span>최근 업데이트</span>
        </div>
        {progressItems.map((item) => (
          <article className="table-row" role="row" key={item.id}>
            <span className="type-pill">{item.type}</span>
            <strong>{item.title}</strong>
            <span>{item.department}</span>
            <StatusBadge status={item.status} />
            <span>{item.updatedAt}</span>
          </article>
        ))}
      </div>
      <div className="notice-card">
        <strong>운영 안내</strong>
        <p>공약 단계는 학생회 내부 논의 중, 구체화 중, 선생님과 논의 중, 허가, 실행 중, 완료 순서로 공개됩니다.</p>
      </div>
    </section>
  )
}

export default PolicyProgress
