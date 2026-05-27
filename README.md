# 한국디지털미디어고등학교 학생자치회 웹사이트

React + Vite + TypeScript 기반의 학생자치회 공식 웹사이트 예시입니다. Firebase Authentication Google 로그인을 사용하며, 주요 제출/평가 기능은 mock data와 localStorage로 동작합니다.

## 실행 방법

```bash
npm install
npm run dev
```

빌드 확인:

```bash
npm run build
```

## Firebase 설정

1. Firebase Console에 접속합니다.
   https://console.firebase.google.com
2. `프로젝트 추가`를 눌러 새 프로젝트를 만들거나 기존 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 `프로젝트 개요` 옆 톱니바퀴를 누른 뒤 `프로젝트 설정`으로 이동합니다.
4. `일반` 탭의 `내 앱` 영역에서 웹 앱 아이콘 `</>`을 선택합니다.
5. 앱 닉네임을 입력하고 웹 앱을 등록합니다.
6. 등록 후 표시되는 `firebaseConfig` 코드에서 아래 값을 복사합니다.
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
7. 프로젝트 루트에 `.env` 파일을 만들고 `.env.example` 형식에 맞춰 값을 붙여 넣습니다.

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAILS=admin@example.com,second-admin@example.com
```

`.env` 파일은 Git에 포함하지 않습니다. 현재 `.gitignore`에 `.env`와 `.env.*`가 등록되어 있습니다.

### Google 로그인 활성화

1. Firebase Console 왼쪽 메뉴에서 `Authentication`을 선택합니다.
2. 처음 사용하는 경우 `시작하기`를 누릅니다.
3. `Sign-in method` 탭으로 이동합니다.
4. 제공업체 목록에서 `Google`을 선택합니다.
5. `사용 설정`을 켭니다.
6. 프로젝트 공개용 이름과 지원 이메일을 선택합니다.
7. `저장`을 누릅니다.

### Authorized Domains 설정

1. Firebase Console의 `Authentication` 메뉴로 이동합니다.
2. `Settings` 탭을 엽니다.
3. `Authorized domains` 영역을 확인합니다.
4. 로컬 개발용으로 `localhost`가 포함되어 있어야 합니다.
5. 배포 후에는 실제 배포 도메인을 추가합니다.
   예: `student-council.example.com`, `your-project.web.app`, `your-project.firebaseapp.com`
6. Vite 개발 서버 주소가 `http://localhost:5173`이어도 Authorized domains에는 포트 없이 `localhost`만 등록합니다.

### 환경변수 복사 위치

Firebase의 `firebaseConfig` 값은 다음처럼 대응해서 `.env`에 넣습니다.

```ts
const firebaseConfig = {
  apiKey: 'VITE_FIREBASE_API_KEY에 입력',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN에 입력',
  projectId: 'VITE_FIREBASE_PROJECT_ID에 입력',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET에 입력',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID에 입력',
  appId: 'VITE_FIREBASE_APP_ID에 입력',
}
```

`.env` 파일을 수정한 뒤에는 개발 서버를 재시작해야 값이 반영됩니다.

### Firestore Database 활성화

관리자 페이지에서 회원가입 명단을 보려면 Firestore Database가 필요합니다.

1. Firebase Console 왼쪽 메뉴에서 `Firestore Database`를 선택합니다.
2. `데이터베이스 만들기`를 누릅니다.
3. 배포 목적이면 테스트 모드 대신 잠금 모드로 시작한 뒤 이 저장소의 `firestore.rules`를 배포합니다.
4. 위치는 기본값 또는 가까운 리전을 선택합니다.
5. 생성 후 웹사이트에서 회원가입 정보를 저장하면 `studentProfiles` 컬렉션에 저장됩니다.

현재 사용하는 Firestore 컬렉션은 다음과 같습니다.

- `studentProfiles`: 회원가입한 학생 정보
- `clubApplications`: 동아리 지원서
- `clubRoleAssignments`: 관리자 페이지에서 부여한 동아리원/동아리장 권한
- `clubIntros`: 동아리장이 수정한 동아리 소개글

운영 배포 전에는 테스트 모드 대신 Firebase Authentication 기반 보안 규칙을 설정해야 합니다. 이 저장소의 `firestore.rules`는 다음을 제한합니다.

- `@dimigo.hs.kr` 계정과 관리자 이메일만 주요 쓰기 가능
- 회원 정보와 동아리 지원서는 본인 문서만 생성/수정 가능
- 관리자만 전체 회원 목록과 권한 목록 조회 가능
- 동아리원/동아리장은 본인 동아리를 선택한 지원서만 조회 가능
- 동아리 소개글은 관리자 또는 해당 동아리장만 수정 가능
- 저장 문서의 필드와 문자열 길이를 제한해 과도한 데이터 저장을 차단

Firebase CLI를 사용하는 경우 예시:

```bash
firebase deploy --only firestore:rules
```

`firestore.rules`의 관리자 이메일 목록과 `.env`의 `VITE_ADMIN_EMAILS`는 동일하게 관리해야 합니다.

## 로그인 정책

- Google 로그인만 제공합니다.
- 이메일이 `@dimigo.hs.kr`로 끝나는 계정만 로그인 상태를 유지합니다.
- 관리용 예외 계정으로 `hwanwook100510@gmail.com`은 로그인할 수 있습니다.
- 다른 도메인 계정은 즉시 로그아웃되며 `한국디지털미디어고등학교 계정만 로그인할 수 있습니다.` 안내가 표시됩니다.
- 로그인 후 회원가입 페이지에서 학년, 반, 번호, 이름을 등록할 수 있습니다.
- 관리자 계정은 회원가입한 학생에게 동아리원 또는 동아리장 지위를 부여할 수 있습니다.
- 동아리장은 자신의 동아리 소개글을 수정할 수 있고, 동아리원과 동아리장은 해당 동아리에 들어온 지원서를 확인할 수 있습니다.
- 정책 제안, 동아리 지원, 학생회 평가제 참여는 로그인한 사용자만 사용할 수 있습니다.
- 홈, 학생회 소개, 공약 진행 현황 등 공개 페이지는 로그인 없이 볼 수 있습니다.

보안 참고: 현재 도메인 검사는 클라이언트에서 수행합니다. 실제 배포 시에는 Firestore Rules, Cloud Functions, 백엔드 API 등 서버 측에서도 `@dimigo.hs.kr` 계정 검증을 반드시 추가해야 합니다.

회원가입 명단, 동아리 지원서, 동아리 권한, 동아리 소개글은 Firestore에 저장됩니다. 브라우저 `localStorage`도 개발 중 임시 표시와 오프라인 fallback 용도로 함께 사용합니다. 실제 운영 시에는 Firestore Rules 또는 백엔드에서 관리자/동아리장 권한을 반드시 검증해야 합니다.

## 주요 기능

- 메인 홈: 학생자치회 소개, 핵심 메뉴, 공약 단계와 정책 요약 카드
- 학생회 인원 소개: mock data 기반 부서별 부장/차장 카드와 필터
- 회원가입: 로그인한 학생의 학년, 반, 번호, 이름 저장
- 관리자: 회원 명단 확인과 동아리원/동아리장 권한 부여
- 동아리 관리: 동아리 소개글 수정, 지원자 명단 확인
- 학생회 평가제: 로그인 사용자 대상 평가 항목별 진행률 표시와 localStorage 기반 평가 반영
- 동아리 지원: 회원가입 정보 기반 1순위, 2순위, 3순위 동아리 지원 폼과 1순위 동아리 질문 답변
- 학생 정책 제안: 정책 제안 폼과 제출된 제안 카드 목록
- 진행 현황 공개: 공약/학생 제안의 담당 부서, 현재 단계, 업데이트일 표시

## 코드 구조

- `src/components`: 공통 레이아웃, 로그인 버튼, 보호 라우트, 섹션 헤더, 진행률 바, 상태 배지
- `src/contexts/AuthContext.tsx`: Firebase 로그인 상태 전역 관리
- `src/contexts/useAuth.ts`: 로그인 상태 접근 훅
- `src/pages`: 각 메뉴별 페이지 컴포넌트
- `src/data/mockData.ts`: 학생회 인원, 정책 현황, 제안, 평가 mock data
- `src/firebase.ts`: Firebase 앱과 Google Provider 초기화
- `src/hooks/useLocalStorage.ts`: localStorage 상태 관리 훅
- `src/types.ts`: 공통 타입 정의

## 참고

Tailwind CSS는 기본 설치되어 있지 않아 일반 CSS로 반응형 UI를 구현했습니다.
