import type { EvaluationResult, Member, Notice, PolicySuggestion, ProgressItem, Schedule } from '../types'

export const members: Member[] = [
  { id: 1, name: '박동우', role: '회장 후보', department: '회장단', intro: '학생이 체감하는 변화를 만드는 대표가 되겠습니다.' },
  { id: 2, name: '정환욱', role: '부회장 후보', department: '회장단', intro: '학생들의 의견을 빠르게 듣고 실행으로 연결하겠습니다.' },
  { id: 3, name: '문태웅', role: '부장', department: '급식안전부', intro: '급식 만족도와 학교생활 안전 관련 의견을 수렴합니다.' },
  { id: 4, name: '이로아', role: '차장', department: '급식안전부', intro: '급식안전부 운영을 지원하고 학생 의견을 정리합니다.' },
  { id: 5, name: '김재준', role: '부장', department: '문예창작부', intro: '문예 활동과 창작 중심의 학생 참여 프로그램을 기획합니다.' },
  { id: 6, name: '문소연', role: '차장', department: '문예창작부', intro: '문예창작부 행사의 준비와 운영을 돕습니다.' },
  { id: 7, name: '안호현', role: '부장', department: '바른생활부', intro: '질서 있고 서로 존중하는 학교 문화를 만들어갑니다.' },
  { id: 8, name: '오정민', role: '차장', department: '바른생활부', intro: '바른생활 캠페인과 생활 규칙 안내를 지원합니다.' },
  { id: 9, name: '박재현', role: '부장', department: '사무행정부', intro: '학생회 문서, 회의, 운영 절차를 체계적으로 관리합니다.' },
  { id: 10, name: '이시우', role: '차장', department: '사무행정부', intro: '회의 기록과 행정 업무를 꼼꼼하게 지원합니다.' },
  { id: 11, name: '양현준', role: '부장', department: '생활스포츠부', intro: '체육 활동과 생활 스포츠 행사를 운영합니다.' },
  { id: 12, name: '여준호', role: '차장', department: '생활스포츠부', intro: '스포츠 행사 진행과 참여 안내를 담당합니다.' },
  { id: 13, name: '김민찬', role: '부장', department: 'IT부', intro: '학생회 온라인 서비스와 IT 기반 편의 기능을 담당합니다.' },
  { id: 14, name: '문지혁', role: '차장', department: 'IT부', intro: 'IT 시스템 관리와 온라인 운영을 지원합니다.' },
  { id: 15, name: '이민규', role: '부장', department: '총무부', intro: '학생회 예산과 물품을 투명하게 관리합니다.' },
  { id: 16, name: '박세진', role: '차장', department: '총무부', intro: '물품 정리와 예산 집행 보조를 담당합니다.' },
  { id: 17, name: '왕지원', role: '부장', department: '학생복지부', intro: '학생들의 학교생활 불편을 개선하고 복지 의견을 반영합니다.' },
  { id: 18, name: '강지유', role: '차장', department: '학생복지부', intro: '복지 제안 접수와 개선 사항 정리를 지원합니다.' },
  { id: 19, name: '이재진', role: '부장', department: '홍보부', intro: '학생회 소식과 주요 공지를 정확하고 빠르게 전달합니다.' },
  { id: 20, name: '김민준', role: '차장', department: '홍보부', intro: '공지 제작과 홍보 콘텐츠 운영을 지원합니다.' },
  { id: 21, name: '이경원', role: '부장', department: '환경예술부', intro: '학교 환경 개선과 예술 활동을 함께 기획합니다.' },
  { id: 22, name: '박상현', role: '차장', department: '환경예술부', intro: '환경예술부 활동 준비와 현장 운영을 돕습니다.' },
]

export const progressItems: ProgressItem[] = [
  { id: 1, type: '공약', title: '프로젝트실 신청 절차 단순화', department: '사무행정부', status: '선생님과 논의 중', updatedAt: '2026-05-22' },
  { id: 2, type: '공약', title: '투명한 학생회', department: '홍보부', status: '실행 중', updatedAt: '2026-05-22' },
  { id: 3, type: '공약', title: '학생 정책 제안제', department: '학생복지부', status: '구체화 중', updatedAt: '2026-05-22' },
  { id: 4, type: '공약', title: 'e-스포츠 대회 개최', department: '생활스포츠부', status: '학생회 내부 논의 중', updatedAt: '2026-05-22' },
  { id: 5, type: '공약', title: '자판기 설치', department: '학생복지부', status: '선생님과 논의 중', updatedAt: '2026-05-22' },
  { id: 6, type: '공약', title: '대회 연계 프로그램', department: 'IT부', status: '구체화 중', updatedAt: '2026-05-22' },
  { id: 7, type: '공약', title: '사복 귀가 시행', department: '바른생활부', status: '허가', updatedAt: '2026-05-22' },
  { id: 8, type: '공약', title: '기숙사 방역', department: '환경예술부', status: '실행 중', updatedAt: '2026-05-22' },
  { id: 9, type: '공약', title: '잔류 자율성 강화', department: '사무행정부', status: '구체화 중', updatedAt: '2026-05-22' },
  { id: 10, type: '공약', title: '전체 잔류일을 활용한 학예회', department: '문예창작부', status: '학생회 내부 논의 중', updatedAt: '2026-05-22' },
]

export const initialSuggestions: PolicySuggestion[] = [
  { id: 'mock-101', title: '학생회 공지 통합 캘린더', category: '소통', content: '행사, 신청, 회의록 공개 일정을 한 달 단위로 볼 수 있으면 좋겠습니다.', effect: '공지 누락을 줄이고 학생 참여율을 높일 수 있습니다.', createdAt: '2026-05-07' },
  { id: 'mock-102', title: '동아리실 사용 예약 현황 공개', category: '동아리', content: '동아리실 예약 가능 시간을 온라인에서 확인하고 싶습니다.', effect: '공간 사용 충돌을 줄이고 동아리 활동 계획을 세우기 쉬워집니다.', createdAt: '2026-05-10' },
]

export const initialEvaluation: EvaluationResult = {
  promise: 82,
  communication: 76,
  event: 88,
  reflection: 71,
}

export const summary = {
  pledgeCount: progressItems.length,
  activePolicies: progressItems.filter((item) => item.status !== '완료').length,
  suggestions: initialSuggestions.length + 18,
}

export const notices: Notice[] = [
  { id: 1, category: '회의록', title: '5월 정기 학생회 회의록 공개', date: '2026-05-18', summary: '급식 의견 창구, 동아리 홍보 주간, 분실물 안내 개선 안건을 공유합니다.' },
  { id: 2, category: '모집', title: '동아리 지원 기간 및 제출 서류 안내', date: '2026-05-20', summary: '지원서와 활동 계획서 제출 일정을 확인하고 신청 전 유의사항을 확인해주세요.' },
  { id: 3, category: '설문', title: '학생회 활동 만족도 1차 평가 진행', date: '2026-05-24', summary: '학생회 공약 이행과 행사 운영에 대한 의견을 평가제 페이지에서 남길 수 있습니다.' },
]

export const schedules: Schedule[] = [
  { id: 1, date: '05.22', title: '학급 의견 수렴 마감', target: '전 학급' },
  { id: 2, date: '05.27', title: '동아리 홍보 주간 운영 회의', target: '동아리 대표' },
  { id: 3, date: '05.31', title: '동아리 지원 접수 종료', target: '지원 희망 학생' },
]
