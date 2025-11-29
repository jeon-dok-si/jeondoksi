# 전독시 프론트엔드 상세 구현 마일스톤

이 문서는 전독시 프론트엔드 애플리케이션의 **구체적인 구현 가이드**입니다. 각 단계는 코드 레벨의 상세한 지침을 포함하고 있으며, 순서대로 따라하면 완성할 수 있도록 구성되었습니다.

## 📋 프로젝트 기본 정보

- **서버 Base URL**: `http://3.105.194.12:8080` (추후 HTTPS 적용 시 변경 가능)
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: CSS Modules (Vanilla CSS)
- **패키지 매니저**: `npm`

---

## 🗓️ 상세 마일스톤 로드맵

### 1단계: 프로젝트 초기화 및 환경 설정 (Day 1)
**목표**: 개발 환경을 완벽하게 구축하고 API 통신 준비를 마칩니다.

#### 1-1. Next.js 프로젝트 생성
터미널에서 다음 명령어를 실행하여 프로젝트를 생성합니다.
```bash
npx create-next-app@latest . \
  --typescript \
  --eslint \
  --no-tailwind \
  --src-dir \
  --app \
  --import-alias "@/*"
```
*설치 후 `npm install axios clsx react-icons` 명령어로 필수 라이브러리를 추가 설치합니다.*

#### 1-2. 디렉토리 구조 정리
`src` 폴더 내부를 다음과 같이 구성합니다. 불필요한 파일(`page.module.css` 등)은 삭제하거나 내용을 비웁니다.
```
src/
├── app/                 # 페이지 (App Router)
│   ├── (auth)/          # 로그인/회원가입 (Route Group)
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/          # 메인 서비스 (Layout 공유)
│   │   ├── page.tsx     # 홈 (대시보드)
│   │   ├── search/      # 책 검색
│   │   ├── report/      # 독후감 작성
│   │   ├── quiz/        # 퀴즈
│   │   └── shop/        # 상점
│   ├── layout.tsx       # Root Layout
│   └── globals.css      # 전역 스타일
├── components/          # 컴포넌트
│   ├── atoms/           # 버튼, 인풋, 라벨
│   ├── molecules/       # 검색바, 카드, 모달
│   └── organisms/       # 헤더, 푸터, 복잡한 폼
├── lib/                 # 유틸리티
│   ├── axios.ts         # Axios 인스턴스
│   └── utils.ts         # 기타 헬퍼 함수
├── styles/              # 스타일
│   └── variables.css    # CSS 변수
├── types/               # 타입 정의
│   └── index.ts
└── hooks/               # 커스텀 훅
    └── useAuth.ts
```

#### 1-3. 환경 변수 설정
루트 경로에 `.env.local` 파일을 생성합니다.
```env
NEXT_PUBLIC_API_URL=http://3.105.194.12:8080
```

#### 1-4. Axios 인스턴스 설정 (`src/lib/axios.ts`)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// 요청 인터셉터: 토큰 자동 주입
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

### 2단계: 디자인 시스템 및 공통 컴포넌트 (Day 2)
**목표**: 앱의 룩앤필을 결정하는 스타일과 기본 블록을 만듭니다.

#### 2-1. CSS 변수 설정 (`src/styles/variables.css`)
`src/app/globals.css` 상단에 이 파일을 import 하거나 내용을 복사합니다.
```css
:root {
  /* Brand Colors */
  --color-primary: #10B981;       /* Emerald 500: 메인 초록 */
  --color-primary-dark: #059669;  /* Emerald 600: 호버 시 */
  --color-secondary: #F59E0B;     /* Amber 500: 골드/보상 */
  
  /* Backgrounds */
  --bg-main: #F8FAFC;             /* Slate 50 */
  --bg-card: rgba(255, 255, 255, 0.8); /* Glassmorphism */
  
  /* Text */
  --text-primary: #1E293B;        /* Slate 800 */
  --text-secondary: #64748B;      /* Slate 500 */
  
  /* Spacing */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Border Radius */
  --radius-md: 12px;
  --radius-lg: 20px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

#### 2-2. 핵심 컴포넌트 구현
*   **Button (`src/components/atoms/Button.tsx`)**:
    *   Props: `variant` ('primary' | 'secondary' | 'ghost'), `size`, `isLoading`.
    *   Style: `var(--color-primary)` 배경, 흰색 텍스트, 둥근 모서리.
*   **Input (`src/components/atoms/Input.tsx`)**:
    *   Style: `border: 1px solid #E2E8F0`, focus 시 `var(--color-primary)` 테두리.
*   **Card (`src/components/molecules/Card.tsx`)**:
    *   Style: `backdrop-filter: blur(10px)`, `background: var(--bg-card)`, `box-shadow: var(--shadow-md)`.

---

### 3단계: 인증 시스템 구현 (Day 3)
**목표**: 사용자가 가입하고 로그인하여 토큰을 발급받도록 합니다.

#### 3-1. 타입 정의 (`src/types/index.ts`)
```typescript
export interface User {
  userId: number;
  email: string;
  nickname: string;
  level: number;
  point: number;
  // ... 기타 필드
}

export interface AuthResponse {
  accessToken: string;
}
```

#### 3-2. 회원가입 페이지 (`src/app/(auth)/signup/page.tsx`)
*   **UI**: 이메일, 비밀번호, 닉네임 입력 폼.
*   **로직**:
    1.  각 필드 유효성 검사 (비밀번호 8자 이상 등).
    2.  `api.post('/api/v1/auth/signup', data)` 호출.
    3.  성공 시 `/login`으로 이동 및 토스트 메시지 출력.

#### 3-3. 로그인 페이지 (`src/app/(auth)/login/page.tsx`)
*   **UI**: 이메일, 비밀번호 입력 폼.
*   **로직**:
    1.  `api.post('/api/v1/auth/login', data)` 호출.
    2.  응답받은 `accessToken`을 `localStorage`에 저장.
    3.  `/` (홈)으로 리다이렉트.

---

### 4단계: 도서 검색 및 독후감 작성 (Day 4-5)
**목표**: 네이버 책 검색 API 결과를 보여주고 독후감을 제출합니다.

#### 4-1. 도서 검색 (`src/app/(main)/search/page.tsx`)
*   **API**: `GET /api/v1/books/search?query={keyword}`
*   **UI**:
    *   검색어 입력 후 엔터 -> API 호출.
    *   결과 리스트를 `Grid` 형태로 표시 (책 표지, 제목, 저자).
    *   책 클릭 시 `selectedBook` 상태에 저장하고 독후감 작성 페이지로 이동(Query Parameter `?isbn=...` 활용).

#### 4-2. 독후감 작성 (`src/app/(main)/report/page.tsx`)
*   **상태 관리**: `content` (string), `length` (number).
*   **UI**:
    *   상단: 선택한 책 정보 표시.
    *   중앙: `textarea` (min-height: 300px).
    *   하단: 글자 수 표시 (`current / 50자`). 50자 미만 시 버튼 비활성화.
*   **제출 로직**:
    1.  `api.post('/api/v1/reports', { isbn, title, content })` 호출.
    2.  로딩 스피너 표시 (AI 분석 대기).
    3.  성공 시 결과 모달 띄우기 -> "퀴즈 풀러 가기" 버튼 노출.

---

### 5단계: 퀴즈 및 게임화 (Day 6-7)
**목표**: 독후감 기반 퀴즈를 풀고 보상을 획득합니다.

#### 5-1. 퀴즈 풀이 (`src/app/(main)/quiz/[isbn]/page.tsx`)
*   **API**: `GET /api/v1/quizzes/{isbn}` (퀴즈 생성/조회).
*   **상태 관리**: `currentQuestionIndex` (0~4), `answers` (배열).
*   **UI**:
    *   한 번에 한 문제씩 표시.
    *   객관식: 버튼 4개 나열.
    *   OX: O/X 큰 아이콘 버튼.
    *   단답형: Input 필드.
*   **제출**: 마지막 문제 풀이 후 `POST /api/v1/quizzes/submit` 호출.

#### 5-2. 상점 및 가챠 (`src/app/(main)/shop/page.tsx`)
*   **API**: `POST /api/v1/gamification/gacha`.
*   **UI**:
    *   "100 Point로 뽑기" 버튼.
    *   CSS Keyframes를 이용한 상자 흔들림 애니메이션 (`@keyframes shake { ... }`).
    *   결과 등장 시 모달 팝업 (희귀도에 따라 배경색 변경: Common-Gray, Rare-Blue, Epic-Purple).

---

### 6단계: 마이페이지 및 대시보드 (Day 8)
**목표**: 사용자의 성장과 캐릭터를 시각화합니다.

#### 6-1. 홈 대시보드 (`src/app/(main)/page.tsx`)
*   **API**: `GET /api/v1/users/me` (병렬 호출로 추천 도서도 함께 가져옴).
*   **UI**:
    *   **프로필 섹션**: 닉네임, 레벨 뱃지, XP 진행바 (`<progress>` 태그 커스텀).
    *   **캐릭터 섹션**: `position: relative`를 사용하여 `body`, `head`, `face` 이미지를 겹쳐서 렌더링.
    *   **추천 도서**: 가로 스크롤(`overflow-x: auto`) 가능한 카드 리스트.

---

### 7단계: 배포 및 최적화 (Day 9)
**목표**: 실제 사용 가능한 상태로 만듭니다.

#### 7-1. 빌드 및 테스트
*   `npm run build` 실행하여 에러가 없는지 확인.
*   `console.log` 등 디버깅 코드 제거.

#### 7-2. Vercel 배포
1.  GitHub에 코드 푸시.
2.  Vercel 대시보드에서 프로젝트 Import.
3.  Environment Variables에 `NEXT_PUBLIC_API_URL` = `http://3.105.194.12:8080` 등록.
4.  Deploy 클릭.

---

## 💡 개발 팁 (Tips)
*   **이미지 처리**: 외부 이미지(네이버 책 표지 등)를 `next/image`로 쓰려면 `next.config.js`에 도메인 허용 설정이 필요합니다. 초기에는 `<img>` 태그를 사용하여 빠르게 구현하는 것을 권장합니다.
*   **아이콘**: `react-icons/fi` (Feather Icons) 계열이 깔끔하고 잘 어울립니다.
*   **글래스모피즘**: 배경색에 투명도를 주고 `backdrop-filter: blur(10px)`를 적용하면 뒤에 있는 요소가 은은하게 비쳐보여 고급스럽습니다.
