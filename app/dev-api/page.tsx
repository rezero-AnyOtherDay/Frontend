"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, RefreshCw } from "lucide-react";

interface ApiEndpoint {
  category: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Debug Health
  {
    category: "Debug",
    name: "Health Check",
    method: "GET",
    path: "/api/v1/debug/health",
    description: "Check system health and database status",
  },
  {
    category: "Debug",
    name: "Processing Status",
    method: "GET",
    path: "/api/v1/debug/processing-status",
    description: "Get current processing, failed, and pending audio records",
  },

  // Debug - List All Data
  {
    category: "Debug - List",
    name: "List All Guardians",
    method: "GET",
    path: "/api/v1/debug/guardians",
    description: "Get all guardians in system",
  },
  {
    category: "Debug - List",
    name: "List All Wards",
    method: "GET",
    path: "/api/v1/debug/wards",
    description: "Get all protected persons",
  },
  {
    category: "Debug - List",
    name: "List All Audio Records",
    method: "GET",
    path: "/api/v1/debug/audio-records",
    description: "Get all audio records",
  },
  {
    category: "Debug - List",
    name: "Audio Records by Status",
    method: "GET",
    path: "/api/v1/debug/audio-records/by-status",
    description: "Get audio records filtered by status (pending, processing, completed, failed)",
    params: { status: "processing" },
  },
  {
    category: "Debug - List",
    name: "List All Reports",
    method: "GET",
    path: "/api/v1/debug/reports",
    description: "Get all AI reports",
  },

  // Debug - Get Details
  {
    category: "Debug - Details",
    name: "Get Ward Statistics",
    method: "GET",
    path: "/api/v1/debug/wards/{wardId}/stats",
    description: "Get statistics for a specific ward",
    params: { wardId: "5" },
  },
  {
    category: "Debug - Details",
    name: "Get Report Details",
    method: "GET",
    path: "/api/v1/debug/reports/{reportId}/detail",
    description: "Get detailed report including analysis result",
    params: { reportId: "1" },
  },

  // Debug - Modify
  {
    category: "Debug - Modify",
    name: "Update Audio Record Status",
    method: "PUT",
    path: "/api/v1/debug/audio-records/{recordId}/status",
    description: "Update status of an audio record",
    params: { recordId: "1", status: "completed", errorMessage: "" },
  },
  {
    category: "Debug - Delete",
    name: "Delete Audio Record",
    method: "DELETE",
    path: "/api/v1/debug/audio-records/{recordId}",
    description: "Delete an audio record (be careful!)",
    params: { recordId: "1" },
  },
  {
    category: "Debug - Delete",
    name: "Delete Report",
    method: "DELETE",
    path: "/api/v1/debug/reports/{reportId}",
    description: "Delete an AI report (be careful!)",
    params: { reportId: "1" },
  },

  // Guardian API
  {
    category: "Guardian",
    name: "Signup Guardian",
    method: "POST",
    path: "/api/v1/guardians/signup",
    description: "Register a new guardian",
    body: {
      name: "Test Guardian",
      email: "test@example.com",
      password: "password123",
      phone: "010-1234-5678",
    },
  },
  {
    category: "Guardian",
    name: "Login Guardian",
    method: "POST",
    path: "/api/v1/guardians/login",
    description: "Login with guardian credentials",
    body: {
      email: "test@example.com",
      password: "password123",
    },
  },

  // Ward API
  {
    category: "Ward",
    name: "Create Ward",
    method: "POST",
    path: "/api/v1/wards",
    description: "Register a new protected person",
    body: {
      guardianId: 1,
      name: "옥순",
      age: 75,
      gender: "female",
      phone: "010-9876-5432",
      relationship: "mother",
    },
  },
  {
    category: "Ward",
    name: "Get Ward by ID",
    method: "GET",
    path: "/api/v1/wards/{wardId}",
    description: "Get details of a specific ward",
    params: { wardId: "5" },
  },
  {
    category: "Ward",
    name: "List Wards by Guardian",
    method: "GET",
    path: "/api/v1/wards",
    description: "Get all wards for a guardian",
    params: { guardianId: "1" },
  },
  {
    category: "Ward",
    name: "Update Ward Diagnosis",
    method: "PUT",
    path: "/api/v1/wards/{wardId}/diagnosis",
    description: "Update self-diagnosis survey data",
    params: { wardId: "5" },
    body: {
      survey: {
        q1: 3,
        q2: 1,
        q3: 2,
        q4: 4,
        q5: 2,
      },
      answered: true,
      completedAt: new Date().toISOString(),
    },
  },

  // Audio Record API
  {
    category: "Audio",
    name: "List Audio Records",
    method: "GET",
    path: "/api/v1/audio-records/ward/{wardId}",
    description: "Get all audio records for a ward",
    params: { wardId: "5" },
  },
  {
    category: "Audio",
    name: "Get Audio Record",
    method: "GET",
    path: "/api/v1/audio-records/{recordId}",
    description: "Get details of a specific audio record",
    params: { recordId: "1" },
  },
  {
    category: "Audio",
    name: "Get Latest Audio Record",
    method: "GET",
    path: "/api/v1/audio-records/ward/{wardId}/latest",
    description: "Get the most recent audio record for a ward",
    params: { wardId: "5" },
  },

  // Report API
  {
    category: "Report",
    name: "Get Report",
    method: "GET",
    path: "/api/v1/reports/record/{recordId}",
    description: "Get AI analysis report for a record",
    params: { recordId: "1" },
  },
  {
    category: "Report",
    name: "List Reports by Ward",
    method: "GET",
    path: "/api/v1/reports/ward/{wardId}",
    description: "Get all reports for a ward",
    params: { wardId: "5" },
  },
  {
    category: "Report",
    name: "Get Latest Report",
    method: "GET",
    path: "/api/v1/reports/ward/{wardId}/latest",
    description: "Get the most recent report for a ward",
    params: { wardId: "5" },
  },
];

interface ResponseData {
  endpointName: string;
  status: number;
  statusText: string;
  data: unknown;
  timestamp: string;
  duration: number;
}

export default function DevApiPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ResponseData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [customUrl, setCustomUrl] = useState("");
  const [customMethod, setCustomMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [customBody, setCustomBody] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const executeRequest = async (endpoint: ApiEndpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`;
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const startTime = performance.now();

      let url = `${apiUrl}${endpoint.path}`;
      let finalUrl = url;

      // Replace path parameters
      if (endpoint.params) {
        Object.entries(endpoint.params).forEach(([paramKey, paramValue]) => {
          const pathParam = `{${paramKey}}`;
          if (url.includes(pathParam)) {
            url = url.replace(pathParam, String(paramValue));
          }
        });

        // Add query parameters for GET requests
        if (endpoint.method === "GET") {
          const queryParams = new URLSearchParams();
          Object.entries(endpoint.params).forEach(([paramKey, paramValue]) => {
            if (!url.includes(`{${paramKey}}`)) {
              queryParams.append(paramKey, String(paramValue));
            }
          });
          if (queryParams.toString()) {
            url += (url.includes("?") ? "&" : "?") + queryParams.toString();
          }
        }
      }

      finalUrl = url;

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (endpoint.body && (endpoint.method === "POST" || endpoint.method === "PUT")) {
        options.body = JSON.stringify(endpoint.body);
      }

      console.log(`[${endpoint.method}] ${finalUrl}`, options);

      const response = await fetch(finalUrl, options);
      const data = await response.json();

      const endTime = performance.now();
      const duration = endTime - startTime;

      const responseData: ResponseData = {
        endpointName: endpoint.name,
        status: response.status,
        statusText: response.statusText,
        data,
        timestamp: new Date().toISOString(),
        duration: Math.round(duration),
      };

      setResponses((prev) => ({ ...prev, [key]: responseData }));
      console.log(responseData);
    } catch (error) {
      const key = `${endpoint.method}-${endpoint.path}`;
      setResponses((prev) => ({
        ...prev,
        [key]: {
          endpointName: endpoint.name,
          status: 0,
          statusText: "Error",
          data: { error: String(error) },
          timestamp: new Date().toISOString(),
          duration: 0,
        },
      }));
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const executeCustomRequest = async () => {
    if (!customUrl) return;

    const key = `custom-${customUrl}`;
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const startTime = performance.now();

      let url = customUrl.startsWith("http") ? customUrl : `${apiUrl}${customUrl}`;

      const options: RequestInit = {
        method: customMethod,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (customBody && (customMethod === "POST" || customMethod === "PUT")) {
        options.body = customBody;
      }

      const response = await fetch(url, options);
      const data = await response.json().catch(() => response.text());

      const endTime = performance.now();
      const duration = endTime - startTime;

      const responseData: ResponseData = {
        endpointName: `Custom ${customMethod}`,
        status: response.status,
        statusText: response.statusText,
        data,
        timestamp: new Date().toISOString(),
        duration: Math.round(duration),
      };

      setResponses((prev) => ({ ...prev, [key]: responseData }));
      console.log(responseData);
    } catch (error) {
      const key = `custom-${customUrl}`;
      setResponses((prev) => ({
        ...prev,
        [key]: {
          endpointName: `Custom ${customMethod}`,
          status: 0,
          statusText: "Error",
          data: { error: String(error) },
          timestamp: new Date().toISOString(),
          duration: 0,
        },
      }));
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const categories = [...new Set(API_ENDPOINTS.map((ep) => ep.category))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">API 테스트 페이지</h1>
          <p className="text-gray-600">프로젝트의 모든 API 엔드포인트를 테스트할 수 있습니다.</p>
        </div>

        {/* Custom Request Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">커스텀 요청</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-foreground font-mono text-sm"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="/api/v1/debug/health"
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-md text-foreground"
              />
              <button
                onClick={executeCustomRequest}
                disabled={!customUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 font-medium"
              >
                전송
              </button>
            </div>
            {(customMethod === "POST" || customMethod === "PUT") && (
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono text-sm text-foreground"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* API Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const endpoints = API_ENDPOINTS.filter((ep) => ep.category === category);
            const isExpanded = expandedCategory === category;

            return (
              <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : category)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-foreground">
                      {category}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {endpoints.length} endpoints
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-6 space-y-6 border-t border-gray-200">
                    {endpoints.map((endpoint) => {
                      const key = `${endpoint.method}-${endpoint.path}`;
                      const response = responses[key];
                      const isLoading = loading[key];

                      const methodColors: Record<string, string> = {
                        GET: "bg-blue-100 text-blue-700",
                        POST: "bg-green-100 text-green-700",
                        PUT: "bg-yellow-100 text-yellow-700",
                        DELETE: "bg-red-100 text-red-700",
                      };

                      return (
                        <div
                          key={key}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="mb-3">
                            <div className="flex items-start gap-3 mb-2">
                              <span className={`px-3 py-1 rounded font-bold text-sm ${methodColors[endpoint.method]}`}>
                                {endpoint.method}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-mono text-gray-700 break-all">
                                  {endpoint.path}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 ml-20">
                              {endpoint.description}
                            </p>
                          </div>

                          {endpoint.params && (
                            <div className="mb-3 ml-20 bg-gray-50 p-3 rounded text-sm font-mono">
                              <p className="font-bold text-gray-700 mb-1">
                                Parameters:
                              </p>
                              <div className="text-gray-600 space-y-1">
                                {Object.entries(endpoint.params).map(([key, value]) => (
                                  <div key={key}>
                                    {key}: {value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {endpoint.body && (
                            <div className="mb-3 ml-20 bg-gray-50 p-3 rounded text-sm font-mono">
                              <p className="font-bold text-gray-700 mb-1">
                                Request Body:
                              </p>
                              <pre className="text-gray-600 whitespace-pre-wrap break-words">
                                {JSON.stringify(endpoint.body, null, 2)}
                              </pre>
                            </div>
                          )}

                          <button
                            onClick={() => executeRequest(endpoint)}
                            disabled={isLoading}
                            className="ml-20 px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 font-medium"
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                로딩 중...
                              </span>
                            ) : (
                              "테스트"
                            )}
                          </button>

                          {response && (
                            <div className="mt-4 ml-20 bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-auto max-h-96">
                              <div className="mb-2 flex justify-between items-start">
                                <div>
                                  <p className="font-bold">
                                    {response.status} {response.statusText}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {response.timestamp} ({response.duration}ms)
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      JSON.stringify(response.data, null, 2)
                                    )
                                  }
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                              <pre className="whitespace-pre-wrap break-words">
                                {JSON.stringify(response.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">사용 설명</h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>각 카테고리를 클릭하여 API 엔드포인트를 확인할 수 있습니다.</li>
            <li>각 엔드포인트의 "테스트" 버튼을 클릭하여 요청을 실행할 수 있습니다.</li>
            <li>커스텀 요청 섹션에서 직접 URL을 입력하여 테스트할 수 있습니다.</li>
            <li>응답 데이터는 복사 버튼으로 클립보드에 복사할 수 있습니다.</li>
            <li>모든 요청은 브라우저 개발자 도구의 콘솔에서도 확인할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
