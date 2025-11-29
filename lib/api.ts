const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Guardian API
export const guardianAPI = {
  // 회원가입
  async signup(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) {
    const response = await fetch(`${BASE_URL}/guardians/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('회원가입 실패');
    }

    return response.json();
  },

  // 로그인
  async login(email: string, password: string) {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);

    const response = await fetch(`${BASE_URL}/guardians/login?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('로그인 실패');
    }

    return response.json();
  },
};

// Ward API
export const wardAPI = {
  // 피보호자 등록
  async createWard(data: {
    guardianId: number;
    name: string;
    age: number;
    gender: 'male' | 'female';
    phone: string;
    relationship: string;
    diagnosis: string;
  }) {
    try {
      const response = await fetch(`${BASE_URL}/wards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ward 등록 실패 상세:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.message || `피보호자 등록 실패 (${response.status})`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Ward 등록 요청 에러:', error);
      throw error;
    }
  },

  // 피보호자 목록 조회
  async getWards(guardianId: number) {
    const response = await fetch(`${BASE_URL}/wards?guardianId=${guardianId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('피보호자 목록 조회 실패');
    }

    return response.json();
  },

  // 피보호자 상세 조회
  async getWardById(wardId: number) {
    const response = await fetch(`${BASE_URL}/wards/${wardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('피보호자 조회 실패');
    }

    return response.json();
  },

  // 자가진단 수정
  async updateDiagnosis(wardId: number, diagnosis: Record<string, unknown>) {
    const response = await fetch(`${BASE_URL}/wards/${wardId}/diagnosis`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagnosis),
    });

    if (!response.ok) {
      throw new Error('자가진단 수정 실패');
    }

    return response.json();
  },
};

// Audio Record API
export const audioAPI = {
  // 오디오 파일 업로드
  async uploadAudio(wardId: number, file: File, recordedAt?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (recordedAt) {
      formData.append('recordedAt', recordedAt);
    }

    const response = await fetch(`${BASE_URL}/audio-records/ward/${wardId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('오디오 업로드 실패');
    }

    return response.json();
  },

  // 오디오 레코드 조회
  async getRecordById(recordId: number) {
    const response = await fetch(`${BASE_URL}/audio-records/${recordId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('오디오 레코드 조회 실패');
    }

    return response.json();
  },

  // 피보호자의 오디오 레코드 목록
  async getRecordsByWard(wardId: number) {
    const response = await fetch(`${BASE_URL}/audio-records/ward/${wardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('오디오 레코드 목록 조회 실패');
    }

    return response.json();
  },

  // 최신 오디오 레코드 조회
  async getLatestRecord(wardId: number) {
    const response = await fetch(
      `${BASE_URL}/audio-records/ward/${wardId}/latest`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('최신 오디오 레코드 조회 실패');
    }

    return response.json();
  },
};

// Report API
export const reportAPI = {
  // AI 레포트 생성
  async createReport(data: {
    recordId: number;
    analysisResult: string;
  }) {
    const response = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('레포트 생성 실패');
    }

    return response.json();
  },

  // 레포트 조회
  async getReportById(reportId: number) {
    const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('레포트 조회 실패');
    }

    return response.json();
  },

  // 오디오 레코드로 레포트 조회
  async getReportByRecordId(recordId: number) {
    const response = await fetch(`${BASE_URL}/reports/record/${recordId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('레포트 조회 실패');
    }

    return response.json();
  },

  // 피보호자 레포트 목록
  async getReportsByWard(wardId: number) {
    const response = await fetch(`${BASE_URL}/reports/ward/${wardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('레포트 목록 조회 실패');
    }

    return response.json();
  },

  // 레포트 업데이트
  async updateReport(reportId: number, data: {
    analysisResult: string;
  }) {
    const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('레포트 업데이트 실패');
    }

    return response.json();
  },

  // 레포트 삭제
  async deleteReport(reportId: number) {
    const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('레포트 삭제 실패');
    }

    return response.json();
  },

  // 최근 레포트 조회
  async getRecentReports(limit: number = 10) {
    const response = await fetch(
      `${BASE_URL}/reports?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('레포트 조회 실패');
    }

    return response.json();
  },
};
