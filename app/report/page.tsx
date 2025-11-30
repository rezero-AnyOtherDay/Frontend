"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

interface DiagnoseResponse {
  accuracy?: number[];
  asr?: string;
  risk?: string[];
  explain?: string[];
  summary?: string;
}

const diseaseNames = ["뇌졸중", "퇴행성 뇌질환", "정상"];
const allDiseases = ["뇌졸중", "치매", "파킨슨", "루게릭"];

function getRiskLevel(accuracy: number): string {
  if (accuracy >= 70) return "위험";
  if (accuracy >= 50) return "주의";
  if (accuracy >= 30) return "관심";
  return "정상";
}

function getRiskColor(accuracy: number): string {
  if (accuracy >= 70) return "bg-red-500";
  if (accuracy >= 50) return "bg-orange-500";
  if (accuracy >= 30) return "bg-yellow-400";
  return "bg-green-500";
}

export default function ReportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<DiagnoseResponse | null>(null);
  const [wardName, setWardName] = useState("사용자");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log("=== 보고서 페이지 로드 ===");
        const storedRecordId = localStorage.getItem("currentReportRecordId");
        const storedWardName = localStorage.getItem("userName");

        console.log("storedRecordId:", storedRecordId);
        console.log("storedWardName:", storedWardName);

        if (storedWardName) {
          setWardName(storedWardName);
        }

        if (!storedRecordId) {
          console.log("recordId 없음");
          setLoading(false);
          return;
        }

        const reportUrl = `${process.env.NEXT_PUBLIC_API_URL}/reports/record/${storedRecordId}`;
        console.log("보고서 조회 URL:", reportUrl);

        const response = await fetch(reportUrl);
        console.log("응답 상태:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("응답 본문 (원본):", result);

          // 응답 형식이 다양할 수 있으므로 대응
          let analysisResult = result.analysisResult || result.data?.analysisResult;
          console.log("분석 결과 (파싱 전):", analysisResult);

          // analysisResult가 JSON 문자열인 경우 파싱
          if (typeof analysisResult === "string") {
            try {
              analysisResult = JSON.parse(analysisResult);
              console.log("분석 결과 (파싱 후):", analysisResult);
            } catch (parseError) {
              console.error("JSON 파싱 실패:", parseError);
              console.error("원본 문자열:", analysisResult);
              setLoading(false);
              return;
            }
          }

          // 필수 필드 검증
          if (!analysisResult.accuracy) {
            console.error("accuracy 필드 없음");
            setLoading(false);
            return;
          }

          console.log("최종 분석 데이터:", analysisResult);
          setReportData(analysisResult);
        } else {
          console.error("보고서 조회 실패:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("보고서 로드 중 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      fetchReport();
    }
  }, []);

  const headerContent = (
    <div className="px-4 py-3 max-w-md mx-auto">
      <button
        onClick={() => router.push("/")}
        className="text-foreground text-base w-12 h-12 flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <AppLayout hasHeader={true} headerContent={headerContent} showNavigation={false}>
        <div className="flex items-center justify-center py-12">
          <p className="text-foreground">레포트를 불러오는 중...</p>
        </div>
      </AppLayout>
    );
  }

  if (!reportData) {
    return (
      <AppLayout hasHeader={true} headerContent={headerContent} showNavigation={false}>
        <div className="flex items-center justify-center py-12">
          <p className="text-foreground">레포트 데이터를 불러올 수 없습니다.</p>
        </div>
      </AppLayout>
    );
  }

  const primaryAccuracy = reportData.accuracy?.[0] || 0;
  const secondaryAccuracy = reportData.accuracy?.[1] || 0;
  const normalAccuracy = reportData.accuracy?.[2] || 0;

  return (
    <AppLayout hasHeader={true} headerContent={headerContent} showNavigation={false}>
      <div className="px-4 py-4 max-w-md mx-auto w-full">
        {/* Main Result */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">
            {wardName}님의 가장 의심되는 질환은
          </h1>
          <p className="text-3xl font-bold text-[#4291F2]">
            {reportData.risk && reportData.risk.length > 0 ? reportData.risk[0] : "분석 중..."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            정확도: {primaryAccuracy.toFixed(1)}%
          </p>
        </div>

        {/* Results Summary Card */}
        <div className="bg-white p-5 rounded-md shadow-none mb-4">
          <p className="text-sm text-foreground mb-3">
            {diseaseNames[0]}일 확률은{" "}
            <span className="font-semibold">{primaryAccuracy.toFixed(1)}%</span>,
            {diseaseNames[1]}일 확률은{" "}
            <span className="font-semibold">{secondaryAccuracy.toFixed(1)}%</span>,
            {diseaseNames[2]}일 확률은{" "}
            <span className="font-semibold">{normalAccuracy.toFixed(1)}%</span>입니다.
          </p>
          <p className="text-sm text-foreground mb-4">
            종합 소견: {reportData.summary || "분석 결과를 기다리고 있습니다."}
          </p>

          {/* Accuracy Table */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-[#4291F2] mb-3">분석 결과</h3>
            <div className="border border-gray-300">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3 text-center font-medium">질환</th>
                    <th className="py-2 px-3 text-center font-medium">정확도</th>
                    <th className="py-2 px-3 text-center font-medium">위험도</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.accuracy?.map((acc, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="py-2 px-3">{diseaseNames[idx] || `질환 ${idx}`}</td>
                      <td className="py-2 px-3 text-center">{acc.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block ${getRiskColor(acc)} text-white text-xs px-2 py-1 rounded-md`}>
                          {getRiskLevel(acc)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Risk Diseases Cards */}
        {reportData.risk?.map((disease, idx) => (
          <div key={idx} className="bg-white p-5 rounded-md shadow-none mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`inline-block ${getRiskColor(reportData.accuracy?.[idx] || 0)} text-white text-xs px-3 py-1 rounded-full mb-2 shadow-none`}>
                  위험도 {getRiskLevel(reportData.accuracy?.[idx] || 0)}
                </span>
                <h3 className="text-lg font-bold text-foreground">{disease}</h3>
              </div>
            </div>
            <p className="text-sm text-foreground mb-3">
              {reportData.explain?.[idx] || `${disease} 관련 설명입니다.`}
            </p>
            <button className="w-full h-10 bg-[#4291F2] text-white rounded-full shadow-none font-medium text-sm hover:bg-[#3182CE] transition-colors">
              상담하러가기
            </button>
          </div>
        ))}

        {/* ASR Content */}
        {reportData.asr && (
          <div className="bg-white p-5 rounded-md shadow-none mb-4">
            <h3 className="text-base font-bold text-[#4291F2] mb-3">음성 분석 결과</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {reportData.asr}
            </p>
          </div>
        )}

        {/* Recommended Follow-up Actions Section */}
        <div className="bg-[#4291F2] px-4 py-8 max-w-md mx-auto w-full">
          <h2 className="text-xl font-bold text-white text-center mb-6">권장 후속조치</h2>

          <div className="bg-white p-5 rounded-md shadow-none mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3 text-center">다시 측정하기</h3>
            <p className="text-sm text-foreground text-center mb-4">
              2주~1개월 내 음성 다시 업로드 → 경향성 확인
            </p>
            <button className="w-full h-12 bg-[#4291F2] text-white rounded-full shadow-none font-medium text-base hover:bg-[#3182CE] transition-colors">
              2주 뒤 알림 신청
            </button>
          </div>

          <div className="bg-white p-5 rounded-md shadow-none mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3 text-center">전문가 연결하기</h3>
            <button className="w-full h-12 bg-[#4291F2] text-white rounded-full shadow-none font-medium text-base hover:bg-[#3182CE] transition-colors">
              상담하러가기
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
