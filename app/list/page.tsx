"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { audioAPI, reportAPI } from "@/lib/api";

const surveyQuestions = [
  "손이나 팔에 힘이 빠져 물건을 자주 떨어뜨린다",
  "평소보다 움직임이 느리거나 동작이 힘들어 보인다",
  "말이 뭉개지거나 발음이 불명확하다",
  "음식을 삼키기 어려워하거나 사레가 자주 든다",
  "가만히 있어도 근육이 떨리거나 경련이 있다",
  "같은 질문을 반복하거나 방금 일을 자주 잊는다",
  "간단한 계산이나 익숙한 일을 헷갈려 한다",
  "익숙한 길이나 장소에서 방향을 잃는다",
  "단어가 잘 떠오르지 않거나 말이 자주 막힌다",
  "성격이나 감정이 예전과 다르게 변했다",
  "손이나 몸이 쉬고 있을 때 떨림이 있다",
  "걸음이 짧아지거나 보폭이 줄었다",
  "움직임이 굼뜨고 몸이 굳은 듯하다",
  "표정 변화가 줄어 무표정해 보인다",
  "글씨가 전보다 작아지거나 흐려졌다",
  "얼굴, 팔, 다리 중 한쪽 힘이 갑자기 약해진다",
  "말이 어눌해지거나 의사소통이 어려워진다",
  "갑작스럽고 심한 두통을 호소한다",
  "한쪽 시야가 흐려지거나 잘 보이지 않는 순간이 있다",
  "어지러워 서있기나 걷기가 어려운 순간이 있다",
];

const surveyScaleLabels = [
  "매우 아니다",
  "아니다",
  "보통",
  "그렇다",
  "매우 그렇다",
];

// Java LocalDateTime 배열 [year, month, day, hour, minute, second]를 Date로 변환
function parseLocalDateTime(dateValue: any): Date | null {
  if (!dateValue) return null;

  // 이미 문자열 형식이면 그대로 파싱
  if (typeof dateValue === "string") {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }

  // 배열 형식 [year, month, day, hour, minute, second, nano?]
  if (Array.isArray(dateValue) && dateValue.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    // month는 0-based이므로 -1
    const date = new Date(year, month - 1, day, hour, minute, second);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export default function ListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"integrated" | "self-diagnosis">(
    "integrated",
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savedSurveyAnswers, setSavedSurveyAnswers] = useState<number[] | null>(
    null,
  );
  const [savedUserName, setSavedUserName] = useState("");
  const [wardId, setWardId] = useState<number | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !wardId) {
      setUploadError("파일을 선택하고 wardId가 설정되었는지 확인해주세요.");
      return;
    }

    setIsUploadingAudio(true);
    setUploadError(null);

    try {
      const formDataWithFile = new FormData();
      formDataWithFile.append("file", selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/audio-records/ward/${wardId}`,
        {
          method: "POST",
          body: formDataWithFile,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const result = await response.json();
      const newRecordId = result.data?.recordId || result.data?.id;

      if (newRecordId) {
        setShowUploadModal(false);
        setSelectedFile(null);
        localStorage.setItem("recordId", newRecordId.toString());
        router.push("/");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      setUploadError("음성 파일 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWardId = localStorage.getItem("wardId");
      const storedUserName = localStorage.getItem("userName");
      if (storedWardId) {
        setWardId(parseInt(storedWardId));
      }
      if (storedUserName) {
        setSavedUserName(storedUserName);
      }
    }
  }, []);

  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError(null);
      console.log("리포트 목록 조회 중...");

      if (typeof window === "undefined") {
        console.error("브라우저 환경이 아닙니다.");
        return;
      }

      const wardIdStr = localStorage.getItem("wardId");
      if (!wardIdStr) {
        console.error("wardId가 없습니다");
        setReportsError(
          "저장된 피보호자 정보가 없어 통합 분석 목록을 불러올 수 없습니다.",
        );
        return;
      }

      const parsedWardId = parseInt(wardIdStr);
      if (Number.isNaN(parsedWardId)) {
        console.error("wardId 파싱 실패:", wardIdStr);
        setReportsError("피보호자 정보가 올바르지 않습니다.");
        return;
      }

      console.log("리포트 조회 wardId:", parsedWardId);

      // 리포트와 오디오 레코드 동시에 조회
      const [reportsResult, audioRecordsResult] = await Promise.all([
        reportAPI.getReportsByWard(parsedWardId),
        audioAPI.getRecordsByWard(parsedWardId),
      ]);

      console.log("리포트 조회 응답:", reportsResult);
      console.log("오디오 레코드 조회 응답:", audioRecordsResult);

      // 리포트 API는 배열을 직접 반환하거나 {data: [...]} 형식
      const reportsList = (reportsResult as any).data ?? reportsResult ?? [];
      const audioRecordsList =
        (audioRecordsResult as any).data ?? audioRecordsResult ?? [];

      console.log(
        "조회된 리포트 수:",
        Array.isArray(reportsList) ? reportsList.length : 0,
      );
      console.log(
        "조회된 오디오 레코드 수:",
        Array.isArray(audioRecordsList) ? audioRecordsList.length : 0,
      );

      if (Array.isArray(reportsList) && reportsList.length > 0) {
        console.log(
          "첫 번째 리포트 상세:",
          JSON.stringify(reportsList[0], null, 2),
        );
      }

      // 오디오 레코드를 recordId 기준으로 맵핑
      const audioRecordsMap = new Map(
        (Array.isArray(audioRecordsList) ? audioRecordsList : []).map(
          (record: any) => [record.recordId, record],
        ),
      );

      // 리포트에 대응하는 오디오 레코드 정보 추가
      const mergedReports = (Array.isArray(reportsList) ? reportsList : []).map(
        (report: any) => {
          const audioRecord = audioRecordsMap.get(report.recordId);
          return {
            ...report,
            // 오디오 레코드의 status와 uploadedAt 추가
            status: audioRecord?.status || "unknown",
            // snake_case와 camelCase 모두 포함하여 호환성 확보
            uploaded_at: audioRecord?.uploadedAt || report.createdAt,
            uploadedAt: audioRecord?.uploadedAt || report.createdAt,
          };
        },
      );

      console.log("병합된 리포트 목록:", mergedReports);
      if (mergedReports.length > 0) {
        console.log(
          "첫 번째 병합된 리포트:",
          JSON.stringify(mergedReports[0], null, 2),
        );
      }
      setReports(mergedReports);
    } catch (error) {
      console.error("리포트 조회 중 에러:", error);
      setReportsError(
        error instanceof Error
          ? error.message
          : "리포트 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const groupReportsByMonth = (reportsData: any[]) => {
    console.log("groupReportsByMonth 입력 데이터:", reportsData);
    const grouped: Record<string, any[]> = {};

    // 유효한 데이터만 필터링
    const validReports = reportsData.filter((report) => {
      const dateValue =
        report.createdAt ||
        report.created_at ||
        report.uploaded_at ||
        report.uploadedAt ||
        report.recordedAt;

      if (!dateValue) return false;

      const date = parseLocalDateTime(dateValue);
      if (!date || date.getFullYear() < 2000) {
        console.warn("유효하지 않은 날짜 필터링됨:", dateValue, report);
        return false;
      }
      return true;
    });

    console.log("유효한 리포트 수:", validReports.length);
    if (validReports.length === 0) {
      console.warn("유효한 리포트가 없습니다. 입력 데이터:", reportsData);
    }

    validReports.forEach((report) => {
      const dateValue =
        report.createdAt ||
        report.created_at ||
        report.uploaded_at ||
        report.uploadedAt ||
        report.recordedAt;
      const createdDate = parseLocalDateTime(dateValue);

      if (!createdDate) return;

      const monthKey = createdDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
      });

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(report);
    });

    return Object.entries(grouped)
      .map(([month, monthReports]) => ({
        month,
        reports: monthReports.sort((a, b) => {
          const aDateValue =
            a.createdAt ||
            a.created_at ||
            a.uploaded_at ||
            a.uploadedAt ||
            a.recordedAt;
          const bDateValue =
            b.createdAt ||
            b.created_at ||
            b.uploaded_at ||
            b.uploadedAt ||
            b.recordedAt;
          const aDate = parseLocalDateTime(aDateValue);
          const bDate = parseLocalDateTime(bDateValue);
          return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
        }),
      }))
      .sort((a, b) => {
        const aDateValue =
          a.reports[0]?.createdAt ||
          a.reports[0]?.created_at ||
          a.reports[0]?.uploaded_at ||
          a.reports[0]?.uploadedAt ||
          a.reports[0]?.recordedAt;
        const bDateValue =
          b.reports[0]?.createdAt ||
          b.reports[0]?.created_at ||
          b.reports[0]?.uploaded_at ||
          b.reports[0]?.uploadedAt ||
          b.reports[0]?.recordedAt;
        const aDate = parseLocalDateTime(aDateValue);
        const bDate = parseLocalDateTime(bDateValue);
        return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
      });
  };

  const handleReportClick = (recordId: number) => {
    localStorage.setItem("currentReportRecordId", recordId.toString());
    router.push("/report");
  };

  const getRiskLevel = (accuracy: number): string => {
    if (accuracy >= 75) return "위험";
    if (accuracy >= 50) return "주의";
    if (accuracy >= 25) return "관찰";
    return "정상";
  };

  const getReportTitle = (report: any, userName: string): string => {
    if (report.analysisResult) {
      try {
        const analysis =
          typeof report.analysisResult === "string"
            ? JSON.parse(report.analysisResult)
            : report.analysisResult;

        if (!analysis.accuracy) {
          return analysis.summary || "분석 중...";
        }

        const normalAccuracy = analysis.accuracy[2] || 0;
        const diseaseAccuracy = analysis.accuracy[0] || 0; // 뇌졸중
        const secondaryAccuracy = analysis.accuracy[1] || 0; // 퇴행성 뇌질환

        // 정상이 질병들보다 높으면 정상 표시, 아니면 뇌질환 표시
        const isNormalHighest =
          normalAccuracy >= diseaseAccuracy &&
          normalAccuracy >= secondaryAccuracy;

        let titleDisease: string;
        let titleAccuracy: number;

        if (isNormalHighest) {
          titleDisease = "정상";
          titleAccuracy = normalAccuracy;
        } else {
          titleDisease = "뇌질환";
          titleAccuracy = diseaseAccuracy + secondaryAccuracy;
        }

        return `${userName}님이 ${titleDisease}일 확률은\n${titleAccuracy.toFixed(
          0,
        )}%입니다.`;
      } catch (error) {
        return "분석 결과 표시 중...";
      }
    }
    return "분석 대기 중...";
  };

  const getReportSummary = (report: any): string => {
    if (report.analysisResult) {
      try {
        const analysis =
          typeof report.analysisResult === "string"
            ? JSON.parse(report.analysisResult)
            : report.analysisResult;
        // total (종합 소견)을 우선적으로 사용, 없으면 summary 사용
        return analysis.total || analysis.summary || "분석 중...";
      } catch (error) {
        return "분석 결과 표시 중...";
      }
    }
    return "분석 대기 중...";
  };

  const getReportAlert = (_report: any): string | null => {
    // 리스트 카드 상단의 "위험질환:" 문구는 사용하지 않음
    return null;
  };

  const getReportDate = (report: any): string => {
    const dateValue =
      report.createdAt ||
      report.created_at ||
      report.uploadedAt ||
      report.uploaded_at ||
      report.recordedAt;

    if (!dateValue) {
      return "날짜 정보 없음";
    }

    const date = parseLocalDateTime(dateValue);

    if (!date || date.getFullYear() < 2000) {
      return "날짜 정보 없음";
    }

    return date.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reportsByMonth = groupReportsByMonth(reports);

  useEffect(() => {
    if (activeTab !== "self-diagnosis") return;
    if (typeof window === "undefined") return;

    const storedAnswers = localStorage.getItem("surveyAnswers");
    if (storedAnswers) {
      try {
        const parsed = JSON.parse(storedAnswers);
        if (Array.isArray(parsed) && parsed.length === surveyQuestions.length) {
          setSavedSurveyAnswers(parsed);
        } else {
          setSavedSurveyAnswers(null);
        }
      } catch (error) {
        console.error("Failed to parse survey answers", error);
        setSavedSurveyAnswers(null);
      }
    } else {
      setSavedSurveyAnswers(null);
    }

    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setSavedUserName(storedName);
    }
  }, [activeTab]);

  const headerContent = (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-4">
        {savedUserName ? `${savedUserName} 님의 뇌건강` : "뇌건강"}
      </h1>

      {/* Tabs */}
      <div className="flex gap-6">
        <button
          onClick={() => setActiveTab("integrated")}
          className={`pb-2 h-12 text-base flex items-end ${
            activeTab === "integrated"
              ? "text-[#4291F2] border-b-2 border-[#4291F2] font-semibold"
              : "text-[#979EA1]"
          }`}
        >
          통합 분석
        </button>
        <button
          onClick={() => setActiveTab("self-diagnosis")}
          className={`pb-2 h-12 text-base flex items-end ${
            activeTab === "self-diagnosis"
              ? "text-[#4291F2] border-b-2 border-[#4291F2] font-semibold"
              : "text-[#979EA1]"
          }`}
        >
          자가진단표
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout hasHeader={true} headerContent={headerContent}>
      <div className="px-4 py-4 max-w-md mx-auto w-full space-y-6">
        {activeTab === "integrated" && (
          <>
            {/* Upload Section */}
            <div className="bg-white p-6 rounded-md shadow-none mb-6">
              <div className="flex justify-center mb-4">
                <Image
                  src="/icons/list/list-call.svg"
                  alt="통화 아이콘"
                  width={64}
                  height={64}
                />
              </div>
              <p className="text-center text-foreground mb-4">
                {savedUserName
                  ? `${savedUserName}님과의 통화를 들려주세요`
                  : "통화를 들려주세요"}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full h-12 bg-[#4291F2] text-white rounded-full shadow-none font-medium text-base"
              >
                업로드하기
              </button>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {reportsLoading && (
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <span className="inline-block w-6 h-6 border-2 border-[#D0DCFF] border-t-[#4F7DFF] rounded-full animate-spin" />
                    <p className="text-sm text-[#979EA1]">
                      리포트를 불러오는 중입니다...
                    </p>
                  </div>
                </div>
              )}

              {reportsError && !reportsLoading && (
                <Card className="bg-white border-0 p-8 rounded-md shadow-none">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                      <X className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      불러오기 실패
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {reportsError}
                    </p>
                    <Button
                      onClick={fetchReports}
                      className="mt-2 h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-full shadow-none text-sm"
                    >
                      다시 시도
                    </Button>
                  </div>
                </Card>
              )}

              {!reportsLoading &&
                !reportsError &&
                reportsByMonth.length === 0 && (
                  <Card className="bg-white border-0 p-8 rounded-md shadow-none">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <ChevronRight className="h-8 w-8 text-muted-foreground rotate-90" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        아직 기록이 없습니다
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        통화 녹음 파일을 업로드하면 분석 기록이 표시됩니다.
                      </p>
                    </div>
                  </Card>
                )}

              {reportsByMonth.map((monthGroup) => (
                <div key={monthGroup.month}>
                  <h2 className="text-sm text-[#979EA1] mb-3 font-medium">
                    {monthGroup.month}
                  </h2>
                  <div className="space-y-3">
                    {monthGroup.reports.map((report) => (
                      <div
                        key={report.recordId || report.id}
                        onClick={() =>
                          handleReportClick(report.recordId || report.id)
                        }
                        className="bg-white p-4 rounded-md shadow-none cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#979EA1]">
                            {getReportDate(report)}
                          </span>
                          <span className="text-sm text-[#979EA1] capitalize">
                            {report.status === "completed"
                              ? "완료"
                              : report.status === "processing"
                              ? "처리중"
                              : report.status === "failed"
                              ? "실패"
                              : "대기중"}
                          </span>
                        </div>
                        {getReportAlert(report) && (
                          <p className="text-sm text-red-500 font-medium mb-1">
                            {getReportAlert(report)}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {(() => {
                              const title = getReportTitle(
                                report,
                                savedUserName || "사용자",
                              );
                              const lines = title.split("\n");
                              if (lines.length >= 2) {
                                return (
                                  <>
                                    <p className="text-base text-foreground font-medium">
                                      {lines[0]}
                                    </p>
                                    <p className="text-base text-[#4291F2] font-medium">
                                      {lines[1]}
                                    </p>
                                  </>
                                );
                              }
                              return (
                                <p className="text-base text-foreground font-medium">
                                  {title}
                                </p>
                              );
                            })()}
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#979EA1] shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "self-diagnosis" && (
          <div className="bg-white p-6 rounded-md shadow-none space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground text-center">
                {savedUserName}님의 자가진단표
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                최근 입력한 문항 결과입니다.
              </p>
            </div>
            {savedSurveyAnswers ? (
              <>
                <div className="space-y-3">
                  {surveyQuestions.map((question, index) => (
                    <div
                      key={question}
                      className="rounded-lg border border-gray-200 p-4 shadow-none"
                    >
                      <p className="text-sm text-foreground mb-2">{question}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          선택한 답변
                        </span>
                        <span className="text-base font-semibold text-[#4291F2]">
                          {surveyScaleLabels[savedSurveyAnswers[index] ?? 2]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => router.push("/self-diagnosis")}
                  className="w-full h-12 bg-[#4291F2] hover:bg-[#3182CE] text-white rounded-full shadow-none font-medium text-base mt-4"
                >
                  수정하기
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  아직 저장된 자가진단표가 없습니다.
                </p>
                <Button
                  onClick={() => router.push("/self-diagnosis")}
                  className="w-full h-12 bg-[#4291F2] hover:bg-[#3182CE] text-white rounded-full shadow-none font-medium text-base mt-4"
                >
                  자가진단표 작성하기
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-sm p-6 rounded-md shadow-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  음성 녹음 파일 업로드
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadError(null);
                  }}
                  className="h-8 w-8 rounded-md shadow-none"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {uploadError}
                  </div>
                )}

                <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="list-audio-upload"
                  />
                  <label
                    htmlFor="list-audio-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        파일을 선택하세요
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP3, WAV, M4A 형식 지원
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium text-foreground truncate overflow-hidden">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploadingAudio}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-full disabled:opacity-50 shadow-none text-base flex items-center justify-center gap-2"
                >
                  {isUploadingAudio && (
                    <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{isUploadingAudio ? "업로드 중..." : "업로드"}</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
