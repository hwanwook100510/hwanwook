import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { members } from '../data/mockData'

const departments = ['전체', ...Array.from(new Set(members.map((member) => member.department)))]

function Members() {
  const [department, setDepartment] = useState('전체')
  const filteredMembers = department === '전체' ? members : members.filter((member) => member.department === department)
  const groupedMembers = filteredMembers.reduce<Record<string, typeof members>>((groups, member) => {
    groups[member.department] = [...(groups[member.department] ?? []), member]
    return groups
  }, {})

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Council Members"
        title="학생회 인원 소개"
        description="회장단과 각 부서가 맡은 역할을 소개합니다. 부서별 필터로 담당자를 빠르게 확인할 수 있습니다."
      />
      <div className="filter-row" aria-label="부서 필터">
        {departments.map((item) => (
          <button className={department === item ? 'active' : ''} key={item} type="button" onClick={() => setDepartment(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="card-grid members-grid">
        {Object.entries(groupedMembers).map(([groupName, groupMembers]) => (
          <article className="member-card department-card" key={groupName}>
            <span>{groupName}</span>
            <div className="department-members">
              {groupMembers.map((member) => (
                <div className="member-line" key={member.id}>
                  <strong>{member.role}</strong>
                  <h3>{member.name}</h3>
                </div>
              ))}
            </div>
            <p>{groupMembers[0]?.intro}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Members
