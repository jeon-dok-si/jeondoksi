# Backend Specification & Database Design

## 1. 개요
이 문서는 '전독시(전지적 독서 시점)' 프로젝트의 백엔드 설계 및 데이터베이스 구조를 상세히 기술합니다.
Spring Boot 기반의 REST API 서버이며, MySQL(AWS RDS)을 메인 데이터베이스로 사용합니다.

## 2. 기술 스택
- **Language**: Java 17
- **Framework**: Spring Boot 3.x
- **Database**: MySQL 8.0 (AWS RDS)
- **ORM**: JPA (Hibernate)
- **AI Integration**: OpenAI GPT-4o, Naver Book API
- **NLP**: Komoran (형태소 분석기)

## 3. 데이터베이스 설계 (ERD)

### 3.1. Users (사용자)
사용자 정보를 저장하는 핵심 테이블입니다. 게임화 요소를 위한 레벨, 경험치, 포인트 및 성향 스탯을 포함합니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `user_id` | BIGINT | PK | N | 사용자 고유 ID (Auto Increment) |
| `email` | VARCHAR(100) | UQ | N | 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | | N | 암호화된 비밀번호 |
| `nickname` | VARCHAR(50) | | N | 사용자 닉네임 |
| `level` | INT | | N | 현재 레벨 (Default: 1) |
| `current_xp` | INT | | N | 현재 경험치 (Default: 0) |
| `point` | INT | | N | 보유 포인트 (재화) |
| `logic_stat` | INT | | N | 논리 성향 점수 |
| `emotion_stat` | INT | | N | 감성 성향 점수 |
| `action_stat` | INT | | N | 행동 성향 점수 |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

### 3.2. Book (도서)
네이버 API를 통해 검색된 도서 정보를 캐싱하여 저장합니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `isbn` | VARCHAR(20) | PK | N | 도서 ISBN (식별자) |
| `title` | VARCHAR(255) | | N | 도서 제목 |
| `author` | VARCHAR(100) | | N | 저자 |
| `thumbnail` | VARCHAR(500) | | Y | 표지 이미지 URL |
| `description` | TEXT | | Y | 도서 줄거리/소개 |
| `keywords` | TEXT | | Y | TF-IDF 분석용 키워드 (쉼표 구분) |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

### 3.3. Report (독후감)
사용자가 작성한 독후감 및 AI 분석 결과를 저장합니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `report_id` | BIGINT | PK | N | 독후감 ID |
| `user_id` | BIGINT | FK | N | 작성자 (Users 참조) |
| `book_isbn` | VARCHAR(20) | FK | N | 대상 도서 (Book 참조) |
| `content` | TEXT | | N | 독후감 본문 |
| `status` | VARCHAR(20) | | N | 상태 (PENDING, APPROVED, REJECTED) |
| `analysis_type` | VARCHAR(50) | | Y | AI 분석 성향 타입 (ANALYST 등) |
| `logic_score` | INT | | Y | 분석된 논리 점수 |
| `emotion_score` | INT | | Y | 분석된 감성 점수 |
| `action_score` | INT | | Y | 분석된 행동 점수 |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

### 3.4. Quiz (퀴즈)
GPT-4o가 생성한 도서별 퀴즈 세트입니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `quiz_id` | BIGINT | PK | N | 퀴즈 세트 ID |
| `book_isbn` | VARCHAR(20) | FK | N | 대상 도서 (Book 참조) |
| `user_id` | BIGINT | FK | Y | 생성 요청한 사용자 (개인화 퀴즈용) |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

### 3.5. QuizQuestion (퀴즈 문제)
하나의 퀴즈 세트에 포함된 개별 문제들입니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `question_id` | BIGINT | PK | N | 문제 ID |
| `quiz_id` | BIGINT | FK | N | 소속 퀴즈 세트 (Quiz 참조) |
| `question_no` | INT | | N | 문제 번호 (1~5) |
| `type` | VARCHAR(20) | | N | 유형 (MULTIPLE, OX, SHORT) |
| `question` | TEXT | | N | 질문 내용 |
| `options_json` | TEXT | | Y | 보기 (JSON 배열 형태) |
| `answer` | VARCHAR(255) | | N | 정답 |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

### 3.6. QuizLog (퀴즈 기록)
사용자가 퀴즈를 푼 기록입니다. 중복 보상 방지 및 기록용입니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `log_id` | BIGINT | PK | N | 기록 ID |
| `user_id` | BIGINT | FK | N | 사용자 (Users 참조) |
| `quiz_id` | BIGINT | FK | N | 푼 퀴즈 (Quiz 참조) |
| `is_solved` | BOOLEAN | | N | 통과 여부 (60점 이상) |
| `score` | INT | | N | 획득 점수 |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

### 3.7. Item (아이템)
게임화 요소를 위한 아이템 정보입니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `item_id` | BIGINT | PK | N | 아이템 ID |
| `name` | VARCHAR(50) | | N | 아이템 이름 |
| `category` | VARCHAR(20) | | N | 카테고리 (HEAD, FACE, BODY 등) |
| `rarity` | VARCHAR(20) | | N | 희귀도 (COMMON, RARE, EPIC) |
| `image_url` | VARCHAR(500) | | N | 아이템 이미지 URL |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

### 3.8. Inventory (인벤토리)
사용자가 보유한 아이템 목록입니다.

| Column Name | Type | Key | Nullable | Description |
|---|---|---|---|---|
| `inven_id` | BIGINT | PK | N | 인벤토리 ID |
| `user_id` | BIGINT | FK | N | 소유자 (Users 참조) |
| `item_id` | BIGINT | FK | N | 아이템 (Item 참조) |
| `is_equipped` | BOOLEAN | | N | 장착 여부 |
| `created_at` | DATETIME | | N | 생성일 |
| `updated_at` | DATETIME | | N | 수정일 |

## 4. 연관 관계 요약
- **User - Report**: 1:N (한 명의 유저는 여러 독후감을 씀)
- **Book - Report**: 1:N (한 권의 책에 대해 여러 독후감이 존재 가능)
- **User - Quiz**: 1:N (개인화된 퀴즈)
- **Book - Quiz**: 1:N (한 권의 책에 대해 여러 퀴즈 세트 존재 가능)
- **Quiz - QuizQuestion**: 1:N (하나의 퀴즈 세트는 5개의 문제로 구성)
- **User - QuizLog**: 1:N (유저는 여러 퀴즈 기록을 가짐)
- **User - Inventory**: 1:N (유저는 여러 아이템을 보유)
- **Item - Inventory**: 1:N (하나의 아이템은 여러 유저 인벤토리에 존재)

## 5. 주요 비즈니스 로직 흐름
1.  **독후감 제출**: User -> Report 저장 -> NLP 분석 -> User Stat/Exp 업데이트
2.  **퀴즈 생성**: User/Book 정보 -> GPT-4o 프롬프트 -> Quiz/QuizQuestion 저장
3.  **퀴즈 풀기**: User 답안 -> 채점 -> QuizLog 저장 -> (통과 시) User Exp/Point 지급
4.  **아이템 뽑기**: User Point 차감 -> 확률 기반 Item 선택 -> Inventory 저장
5.  **추천**: User의 과거 Report(Book Keywords) 분석 -> TF-IDF 유사도 계산 -> Book 추천
