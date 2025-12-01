"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

interface DiagnoseResponse {
  accuracy?: number[];
  ASR?: string;      // 통화 전사 데이터
  asr?: string;      // 호환성 (소문자)
  risk?: string[];   // ["뇌졸중 위험도", "치매 위험도", "파킨슨병 위험도", "루게릭병 위험도"]
  explain?: string[]; // ["뇌졸중 설명", "치매 설명", "파킨슨병 설명", "루게릭병 설명"]
  total?: string;    // 종합 소견 (3문장, 75자 내외)
  summary?: string;  // 과거~현재 200자 요약 (DB에 저장용)
}

const diseaseNames = ["뇌졸중", "퇴행성 뇌질환", "정상"];
const allDiseases = ["뇌졸중", "치매", "파킨슨", "루게릭"];

function getRiskLevel(accuracy: number): string {
  if (accuracy >= 75) return "위험";
  if (accuracy >= 50) return "주의";
  if (accuracy >= 25) return "관찰";
  return "정상";
}

function getRiskColor(accuracy: number): string {
  if (accuracy >= 75) return "bg-red-500";
  if (accuracy >= 50) return "bg-orange-500";
  if (accuracy >= 25) return "bg-yellow-400";
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
          let analysisResult =
            result.analysisResult || result.data?.analysisResult;
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
          console.error(
            "보고서 조회 실패:",
            response.status,
            response.statusText,
          );
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
      <AppLayout
        hasHeader={true}
        headerContent={headerContent}
        showNavigation={false}
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-foreground">레포트를 불러오는 중...</p>
        </div>
      </AppLayout>
    );
  }

  if (!reportData) {
    return (
      <AppLayout
        hasHeader={true}
        headerContent={headerContent}
        showNavigation={false}
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-foreground">레포트 데이터를 불러올 수 없습니다.</p>
        </div>
      </AppLayout>
    );
  }

  const primaryAccuracy = reportData.accuracy?.[0] || 0;
  const secondaryAccuracy = reportData.accuracy?.[1] || 0;
  const normalAccuracy = reportData.accuracy?.[2] || 0;

  // 가장 높은 퍼센트의 병명 찾기
  const getHighestRiskDisease = () => {
    if (!reportData.accuracy) return null;

    let maxIdx = 0;
    let maxAccuracy = reportData.accuracy[0] || 0;

    reportData.accuracy.forEach((acc, idx) => {
      if (acc > maxAccuracy) {
        maxAccuracy = acc;
        maxIdx = idx;
      }
    });

    const diseaseName = diseaseNames[maxIdx] || "질환";

    return {
      disease: diseaseName,
      accuracy: maxAccuracy,
      riskLevel: getRiskLevel(maxAccuracy),
    };
  };

  const highestRisk = getHighestRiskDisease();

  // 정상 확률이 가장 높은지 여부
  const isNormalHighest =
    normalAccuracy >= primaryAccuracy && normalAccuracy >= secondaryAccuracy;

  return (
    <AppLayout
      hasHeader={true}
      headerContent={headerContent}
      showNavigation={false}
    >
      <div className="px-4 py-4 max-w-md mx-auto w-full">
        {/* Main Result */}
        <div className="mb-6">
          {highestRisk && (
            <>
              <h1 className="text-xl font-bold text-foreground">
                {wardName}님이 {highestRisk.disease}일 확률은
              </h1>
              <p className="text-3xl font-bold text-[#4291F2] mt-2">
                {highestRisk.accuracy.toFixed(0)}%입니다.
              </p>
            </>
          )}
        </div>

        {/* Results Summary Card - 종합소견만 */}
        <div className="bg-white p-5 rounded-md shadow-none mb-4">
          <p className="text-sm text-foreground">
            종합 소견: {reportData.total || reportData.summary || "분석 결과를 기다리고 있습니다."}
          </p>
        </div>

        {/* Analysis Results Card - 분석 결과 별도 문단 */}
        <div className="bg-white p-5 rounded-md shadow-none mb-4">
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
                    <td className="py-2 px-3">
                      {diseaseNames[idx] || `질환 ${idx}`}
                    </td>
                    <td className="py-2 px-3 text-center">{acc.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-center">
                      {diseaseNames[idx] === "정상" ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <span
                          className={`inline-block ${getRiskColor(
                            acc,
                          )} text-white text-xs px-2 py-1 rounded-md`}
                        >
                          {getRiskLevel(acc)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Diseases Cards 또는 정상 안내 */}
        {isNormalHighest ? (
          <div className="bg-white p-5 rounded-md shadow-none mb-4 flex items-center">
            <div className="mr-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                정상일 확률이 높습니다.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                현재로서는 큰 이상 징후가 발견되지 않았어요. 추후 변화가 있으면
                다시 측정해 주세요.
              </p>
            </div>
          </div>
        ) : (
          allDiseases.map((diseaseName, idx) => {
            const riskLevelText = reportData.risk?.[idx] || "정보 없음";
            const explainText =
              reportData.explain?.[idx] || `${diseaseName} 관련 설명입니다.`;

            // explain 텍스트를 불렛 포맷으로 변환 (문장 기준)
            const formatExplainAsBullets = (text: string) => {
              // 문장 단위로 분리 (. ! ? 로 끝나는 문장)
              const sentences = text
                .split(/([.!?]\s+)/)
                .filter((s) => s.trim().length > 0 && !/^[.!?]\s*$/.test(s))
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

              // 문장이 없으면 원본 텍스트를 불렛으로 표시
              if (sentences.length === 0) {
                return (
                  <div className="flex items-start mb-2">
                    <span className="text-foreground mr-2 mt-1">•</span>
                    <span className="text-sm text-foreground flex-1">
                      {text}
                    </span>
                  </div>
                );
              }

              return sentences.map((sentence, i) => (
                <div key={i} className="flex items-start mb-2">
                  <span className="text-foreground mr-2 mt-1">•</span>
                  <span className="text-sm text-foreground flex-1">
                    {sentence}
                  </span>
                </div>
              ));
            };

            // risk 텍스트 기반 색상 매핑
            const getRiskColorByText = (level: string) => {
              if (level.includes("위험")) return "bg-red-500";
              if (level.includes("주의")) return "bg-orange-500";
              if (level.includes("관찰")) return "bg-yellow-400";
              return "bg-green-500";
            };

            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-md shadow-none mb-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-full">
                    <span
                      className={`inline-block ${getRiskColorByText(
                        riskLevelText,
                      )} text-white text-xs px-3 py-1 rounded-full mb-2 shadow-none`}
                    >
                      위험도 {riskLevelText}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {diseaseName}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-foreground mb-3">
                  {formatExplainAsBullets(explainText)}
                </div>
                <button className="w-full h-10 bg-[#4291F2] text-white rounded-full shadow-none font-medium text-sm hover:bg-[#3182CE] transition-colors">
                  상담하러가기
                </button>
              </div>
            );
          })
        )}

        {/* ASR Content */}
        {(reportData.ASR || reportData.asr) && (
          <div className="bg-white p-5 rounded-md shadow-none mb-4">
            <h3 className="text-base font-bold text-[#4291F2] mb-3">
              음성 분석 결과
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {reportData.ASR || reportData.asr}
            </p>
          </div>
        )}

        {/* Recommended Follow-up Actions Section */}
        <div className="bg-[#4291F2] px-4 py-8 max-w-md mx-auto w-full">
          <h2 className="text-xl font-bold text-white text-center mb-6">
            권장 후속조치
          </h2>

          <div className="bg-white p-5 rounded-md shadow-none mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3 text-center">
              다시 측정하기
            </h3>
            <p className="text-sm text-foreground text-center mb-4">
              2주~1개월 내 음성 다시 업로드 → 경향성 확인
            </p>
            <button className="w-full h-12 bg-[#4291F2] text-white rounded-full shadow-none font-medium text-base hover:bg-[#3182CE] transition-colors">
              2주 뒤 알림 신청
            </button>
          </div>

          <div className="bg-white p-5 rounded-md shadow-none mb-4">
            <h3 className="text-lg font-bold text-foreground mb-3 text-center">
              전문가 연결하기
            </h3>
            <button className="w-full h-12 bg-[#4291F2] text-white rounded-full shadow-none font-medium text-base hover:bg-[#3182CE] transition-colors">
              상담하러가기
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
