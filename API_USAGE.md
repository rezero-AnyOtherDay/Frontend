# ReZero API 사용 가이드 (프론트엔드)

## 📁 파일 위치
- `lib/api.ts` - 백엔드 API 클라이언트
- `.env.local` - 환경 변수 (API URL)

## 🔧 설정

### 1. 환경 변수 설정 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 📚 API 사용법

### Guardian API (보호자)

#### 1. 회원가입
```typescript
import { guardianAPI } from '@/lib/api';

try {
  const result = await guardianAPI.signup({
    name: '김철수',
    email: 'user@example.com',
    password: 'password123',
    phone: '010-1234-5678'
  });
  console.log('회원가입 성공:', result);
} catch (error) {
  console.error('회원가입 실패:', error);
}
```

#### 2. 로그인
```typescript
try {
  const result = await guardianAPI.login('user@example.com', 'password123');
  console.log('로그인 성공:', result);
  // 보호자 정보 저장 (localStorage, context, 등)
} catch (error) {
  console.error('로그인 실패:', error);
}
```

---

### Ward API (피보호자)

#### 1. 피보호자 등록
```typescript
import { wardAPI } from '@/lib/api';

try {
  const result = await wardAPI.createWard({
    guardianId: 1,
    name: '김할머니',
    age: 75,
    gender: 'female',
    phone: '010-9876-5432',
    relationship: '어머니',
    diagnosis: '{"type":"dementia","stage":"early"}'  // JSON 문자열
  });
  console.log('등록 성공:', result);
} catch (error) {
  console.error('등록 실패:', error);
}
```

#### 2. 피보호자 목록 조회
```typescript
try {
  const wards = await wardAPI.getWards(1);  // guardianId: 1
  console.log('피보호자 목록:', wards);
} catch (error) {
  console.error('조회 실패:', error);
}
```

#### 3. 피보호자 상세 조회
```typescript
try {
  const ward = await wardAPI.getWardById(1);  // wardId: 1
  console.log('피보호자 정보:', ward);
} catch (error) {
  console.error('조회 실패:', error);
}
```

#### 4. 자가진단 수정
```typescript
try {
  const result = await wardAPI.updateDiagnosis(1, {
    type: 'dementia',
    stage: 'moderate',
    medications: ['약1', '약2'],
    notes: '상태 악화 추세'
  });
  console.log('자가진단 업데이트:', result);
} catch (error) {
  console.error('업데이트 실패:', error);
}
```

---

### Audio Record API (오디오 녹음)

#### 1. 오디오 파일 업로드
```typescript
import { audioAPI } from '@/lib/api';

try {
  // HTML input element에서 파일 가져오기
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = input?.files?.[0];

  if (!file) return;

  const result = await audioAPI.uploadAudio(
    1,  // wardId
    file,
    '2024-11-26'  // 선택사항: recordedAt
  );
  console.log('업로드 성공:', result);
} catch (error) {
  console.error('업로드 실패:', error);
}
```

#### 2. 오디오 레코드 조회
```typescript
try {
  const record = await audioAPI.getRecordById(1);  // recordId: 1
  console.log('오디오 레코드:', record);
} catch (error) {
  console.error('조회 실패:', error);
}
```

#### 3. 피보호자의 오디오 목록
```typescript
try {
  const records = await audioAPI.getRecordsByWard(1);  // wardId: 1
  console.log('오디오 목록:', records);
} catch (error) {
  console.error('조회 실패:', error);
}
```

#### 4. 최신 오디오 조회
```typescript
try {
  const latest = await audioAPI.getLatestRecord(1);  // wardId: 1
  console.log('최신 오디오:', latest);
} catch (error) {
  console.error('조회 실패:', error);
}
```

---

### Report API (AI 레포트)

#### 1. AI 레포트 생성
```typescript
import { reportAPI } from '@/lib/api';

try {
  const result = await reportAPI.createReport({
    recordId: 1,
    analysisResult: '{"emotion":"sad","keywords":["memory loss"],"severity":"high"}'
  });
  console.log('레포트 생성:', result);
} catch (error) {
  console.error('생성 실패:', error);
}
```

#### 2. 레포트 조회
```typescript
try {
  const report = await reportAPI.getReportById(1);  // reportId: 1
  console.log('레포트:', report);
} catch (error) {
  console.error('조회 실패:', error);
}
```

#### 3. 레코드로 레포트 조회
```typescript
try {
  const report = await reportAPI.getReportByRecordId(1);  // recordId: 1
  console.log('레포트:', report);
} catch (error) {
  console.error('조회 실패:', error);
}
```

#### 4. 피보호자의 레포트 목록
```typescript
try {
  const reports = await reportAPI.getReportsByWard(1);  // wardId: 1
  console.log('레포트 목록:', reports);
} catch (error) {
  console.error('조회 실패:', error);
}
```

#### 5. 레포트 업데이트
```typescript
try {
  const result = await reportAPI.updateReport(1, {
    analysisResult: '{"emotion":"neutral","severity":"low"}'
  });
  console.log('업데이트:', result);
} catch (error) {
  console.error('업데이트 실패:', error);
}
```

#### 6. 레포트 삭제
```typescript
try {
  await reportAPI.deleteReport(1);  // reportId: 1
  console.log('삭제 완료');
} catch (error) {
  console.error('삭제 실패:', error);
}
```

#### 7. 최근 레포트 조회
```typescript
try {
  const reports = await reportAPI.getRecentReports(10);  // limit: 10
  console.log('최근 레포트:', reports);
} catch (error) {
  console.error('조회 실패:', error);
}
```

---

## 📱 React Hook으로 사용하기

### useGuardian Hook 예시
```typescript
import { useState } from 'react';
import { guardianAPI } from '@/lib/api';

export function useGuardian() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await guardianAPI.login(email, password);
      localStorage.setItem('guardian', JSON.stringify(result));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인 실패';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
```

### 컴포넌트에서 사용
```typescript
'use client';

import { useGuardian } from '@/hooks/useGuardian';

export default function LoginPage() {
  const { login, loading, error } = useGuardian();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      // 로그인 성공 처리
    } catch (err) {
      // 에러 처리
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

## ⚠️ 에러 처리

모든 API 함수는 에러 발생 시 `throw new Error()`를 던집니다.

```typescript
try {
  await guardianAPI.signup({...});
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

---

## 🔐 인증 토큰 저장 (예)

```typescript
// 로그인 후 토큰 저장
const guardian = await guardianAPI.login(email, password);
localStorage.setItem('guardianId', guardian.guardianId);
localStorage.setItem('token', guardian.token);  // 백엔드가 토큰 반환 시

// 이후 API 호출 시 토큰 포함
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

---

## 📡 백엔드 API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/guardians/signup` | 보호자 회원가입 |
| POST | `/guardians/login` | 보호자 로그인 |
| POST | `/wards` | 피보호자 등록 |
| GET | `/wards?guardianId={id}` | 피보호자 목록 |
| GET | `/wards/{wardId}` | 피보호자 상세 |
| PUT | `/wards/{wardId}/diagnosis` | 자가진단 수정 |
| POST | `/audio-records/ward/{wardId}` | 오디오 업로드 |
| GET | `/audio-records/{recordId}` | 오디오 조회 |
| GET | `/audio-records/ward/{wardId}` | 오디오 목록 |
| GET | `/audio-records/ward/{wardId}/latest` | 최신 오디오 |
| POST | `/reports` | 레포트 생성 |
| GET | `/reports/{reportId}` | 레포트 조회 |
| GET | `/reports/record/{recordId}` | 오디오별 레포트 |
| GET | `/reports/ward/{wardId}` | 피보호자 레포트 |
| PUT | `/reports/{reportId}` | 레포트 수정 |
| DELETE | `/reports/{reportId}` | 레포트 삭제 |
| GET | `/reports?limit={n}` | 최근 레포트 |
