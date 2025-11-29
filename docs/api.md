# API Specification

## 1. 개요
전독시 서비스의 REST API 명세서입니다.
- **Base URL**: `http://localhost:8080`
- **Content-Type**: `application/json`
- **Response Format**: 모든 응답은 `ApiResponse` 래퍼 클래스를 통해 반환됩니다.

### 공통 응답 구조
```json
{
  "success": true, // 성공 여부 (true/false)
  "data": { ... }, // 실제 데이터 (실패 시 null)
  "message": null, // 에러 메시지 (성공 시 null)
  "errorCode": null // 에러 코드 (성공 시 null)
}
```

---

## 2. 인증 (Auth)

### 2.1. 회원가입
새로운 사용자를 등록합니다.

- **Endpoint**: `POST /api/v1/auth/signup`
- **Request Body**:
  ```json
  {
    "email": "user@example.com", // 이메일 (필수, 중복 불가)
    "password": "password123",   // 비밀번호 (필수)
    "nickname": "독서왕"         // 닉네임 (필수)
  }
  ```
- **Response**: `userId` (Long)
  ```json
  {
    "success": true,
    "data": 1
  }
  ```

### 2.2. 로그인
이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.

- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiJ9..." // JWT 토큰
    }
  }
  ```

---

## 3. 사용자 (User)

### 3.1. 내 프로필 조회
로그인한 사용자의 상세 정보를 조회합니다. (마이페이지용)

- **Endpoint**: `GET /api/v1/users/me`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "userId": 1,
      "email": "user@example.com",
      "nickname": "독서왕",
      "level": 3,
      "currentXp": 150,
      "point": 500,
      "logicStat": 70,
      "emotionStat": 30,
      "actionStat": 50,
      "character": { // 현재 장착 중인 아이템 이미지 URL
        "headUrl": "http://.../hat.png",
        "faceUrl": null,
        "bodyUrl": "http://.../shirt.png"
      }
    }
  }
  ```

---

## 4. 도서 (Book)

### 4.1. 도서 검색
네이버 책 검색 API를 통해 도서를 검색합니다.

- **Endpoint**: `GET /api/v1/books/search`
- **Query Parameters**:
  - `query`: 검색어 (필수)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "isbn": "97889...",
        "title": "전지적 독자 시점",
        "author": "싱숑",
        "thumbnail": "http://.../cover.jpg",
        "description": "오직 나만이, 이 세계의 결말을 알고 있다..."
      },
      ...
    ]
  }
  ```

---

## 5. 독후감 (Report)

### 5.1. 독후감 제출
독후감을 작성하고 제출합니다. 제출 시 AI 분석이 수행되며 경험치가 지급됩니다.

- **Endpoint**: `POST /api/v1/reports`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "isbn": "97889...",      // 책 ISBN (필수)
    "title": "책 제목",      // 책 제목 (필수)
    "content": "이 책을 읽고..." // 독후감 내용 (최소 50자 이상)
  }
  ```
- **Response**: `reportId` (Long)
  ```json
  {
    "success": true,
    "data": 15
  }
  ```

### 5.2. 내 독후감 목록 조회
내가 작성한 독후감 목록을 조회합니다.

- **Endpoint**: `GET /api/v1/reports/me`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "reportId": 15,
        "bookTitle": "전지적 독자 시점",
        "bookThumbnail": "http://.../cover.jpg",
        "resultType": "ANALYST", // 분석 결과 타입
        "createdAt": "2024-11-28T10:00:00"
      },
      ...
    ]
  }
  ```

---

## 6. 퀴즈 (Quiz)

### 6.1. 퀴즈 조회 (생성)
해당 도서의 퀴즈를 조회합니다. 퀴즈가 없으면 AI가 생성하여 반환합니다. (개인화 퀴즈 포함)

- **Endpoint**: `GET /api/v1/quizzes/{isbn}`
- **Header**: `Authorization: Bearer {accessToken}`
- **Path Variable**: `isbn` (도서 ISBN)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "quizId": 101,
      "questions": [
        {
          "questionNo": 1,
          "type": "MULTIPLE", // 객관식
          "question": "주인공의 이름은?",
          "options": ["김독자", "유중혁", "한수영", "이현성", "정희원"],
          "answer": "김독자" // (참고: 정답이 포함되어 내려옴, 프론트에서 숨김 처리 필요)
        },
        {
          "questionNo": 3,
          "type": "OX", // OX 퀴즈
          "question": "주인공은 회귀자다.",
          "options": ["O", "X"],
          "answer": "X"
        },
        {
          "questionNo": 5,
          "type": "SHORT", // 단답형
          "question": "주인공이 가장 좋아하는 소설의 제목은?",
          "options": [],
          "answer": "멸망한 세계에서 살아남는 세 가지 방법"
        }
      ]
    }
  }
  ```

### 6.2. 퀴즈 제출 (채점)
푼 퀴즈의 답안을 제출하고 채점 결과를 받습니다.

- **Endpoint**: `POST /api/v1/quizzes/submit`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "quizId": 101,
    "answers": [
      { "questionNo": 1, "answer": "김독자" },
      { "questionNo": 2, "answer": "유중혁" },
      { "questionNo": 3, "answer": "X" },
      { "questionNo": 4, "answer": "O" },
      { "questionNo": 5, "answer": "멸살법" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "logId": 505,
      "isSolved": true, // 통과 여부 (60점 이상)
      "score": 80,      // 점수
      "gainedExp": 100  // 획득 경험치 (이미 푼 경우 0)
    }
  }
  ```

---

## 7. 게임화 (Gamification)

### 7.1. 아이템 뽑기 (가챠)
100 포인트를 소모하여 랜덤 아이템을 뽑습니다.

- **Endpoint**: `POST /api/v1/gamification/gacha`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "itemId": 201,
      "name": "황금 왕관",
      "category": "HEAD",
      "rarity": "EPIC",
      "imageUrl": "http://.../crown.png"
    }
  }
  ```

### 7.2. 내 인벤토리 조회
보유한 아이템 목록을 조회합니다.

- **Endpoint**: `GET /api/v1/gamification/inventory`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "invenId": 10,
        "itemId": 201,
        "name": "황금 왕관",
        "category": "HEAD",
        "rarity": "EPIC",
        "imageUrl": "http://.../crown.png",
        "isEquipped": true // 장착 여부
      },
      ...
    ]
  }
  ```

### 7.3. 아이템 장착
특정 아이템을 장착합니다. (같은 카테고리의 기존 아이템은 자동 해제됨)

- **Endpoint**: `POST /api/v1/gamification/inventory/{invenId}/equip`
- **Header**: `Authorization: Bearer {accessToken}`
- **Path Variable**: `invenId` (인벤토리 ID)
- **Response**:
  ```json
  {
    "success": true,
    "data": null
  }
  ```

---

## 8. 추천 (Recommendation)

### 8.1. 도서 추천
사용자의 독서 기록과 성향을 분석하여 책을 추천해줍니다.

- **Endpoint**: `GET /api/v1/recommendations`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "isbn": "97911...",
        "title": "데미안",
        "author": "헤르만 헤세",
        "thumbnail": "http://.../demian.jpg",
        "reason": "당신의 취향과 95.2% 일치" // 추천 사유
      },
      ...
    ]
  }
  ```
