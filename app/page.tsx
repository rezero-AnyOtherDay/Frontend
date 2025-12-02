"use client";

import { useState, useEffect } from "react";
import { ChevronRight, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Image from "next/image";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [showAlert, setShowAlert] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [isCheckingReport, setIsCheckingReport] = useState(false);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [hasCheckedReport, setHasCheckedReport] = useState(false);
  const isReportReady = !!latestReport;
  const router = useRouter();

  // 예시 데이터
  const [userName, setUserName] = useState("");
  const daysWithoutCall = 10;
  const [recentStatus, setRecentStatus] = useState<string | null>(null);
  const alertCount = 3;

  // wardId와 최신 리포트 로드
  useEffect(() => {
    console.log("=== 홈 페이지 초기화 ===");
    if (typeof window !== "undefined") {
      const storedWardId = localStorage.getItem("wardId");
      const storedUserName = localStorage.getItem("userName");
      const storedRecordId = localStorage.getItem("recordId");
      const storedHasCheckedReport = localStorage.getItem("hasCheckedReport");
      const startAIAfterDiagnosis = localStorage.getItem(
        "startAIAfterDiagnosis",
      );

      console.log("localStorage에서 로드:");
      console.log("- wardId:", storedWardId);
      console.log("- userName:", storedUserName);

      if (storedWardId) {
        setWardId(parseInt(storedWardId));
        console.log("wardId 설정됨:", parseInt(storedWardId));
      }
      if (storedUserName) {
        setUserName(storedUserName);
        console.log("userName 설정됨:", storedUserName);
      }
      if (storedRecordId) {
        const parsedRecordId = parseInt(storedRecordId);
        if (!Number.isNaN(parsedRecordId)) {
          setRecordId(parsedRecordId);
          console.log("recordId 설정됨:", parsedRecordId);

          // 자가진단표 수정 후 돌아온 경우, AI 호출 시작
          if (startAIAfterDiagnosis === "true") {
            localStorage.removeItem("startAIAfterDiagnosis");
            console.log("=== 자가진단표 수정 완료, AI 처리 대기 시작 ===");
            setShowAlert(true);
            setIsCheckingReport(true);
            pollReportCompletion(parsedRecordId);
          }
        }
      }
      // latestDiseaseName은 리포트가 실제로 존재할 때만 표시
      // 초기 로드시에는 설정하지 않음 (아래 리포트 조회에서 설정됨)
      if (storedHasCheckedReport === "true") {
        setHasCheckedReport(true);
      }
    }
  }, []);

  // 홈 페이지 로드 시 가장 최근 리포트 조회
  useEffect(() => {
    if (!wardId) return;

    const fetchLatestReport = async () => {
      try {
        console.log("=== 가장 최근 리포트 조회 ===");
        const reportsUrl = `${process.env.NEXT_PUBLIC_API_URL}/reports/ward/${wardId}`;
        const response = await fetch(reportsUrl);

        if (response.ok) {
          const result = await response.json();
          const reports = result.data || result;

          // 가장 최근 리포트 선택
          if (Array.isArray(reports) && reports.length > 0) {
            const latestReport = reports[0];
            console.log("가장 최근 리포트:", latestReport);

            // 리포트 데이터에서 질병 정보 추출
            try {
              let analysisResult =
                latestReport.analysisResult ||
                latestReport.data?.analysisResult;

              if (typeof analysisResult === "string") {
                analysisResult = JSON.parse(analysisResult);
              }

              const accuracy = analysisResult?.accuracy;
              if (accuracy && Array.isArray(accuracy) && accuracy.length > 0) {
                const normalAccuracy = accuracy[2] || 0;
                const diseaseAccuracy = accuracy[0] || 0;
                const secondaryAccuracy = accuracy[1] || 0;

                const isNormalHighest =
                  normalAccuracy >= diseaseAccuracy &&
                  normalAccuracy >= secondaryAccuracy;

                let displayDisease: string;
                if (isNormalHighest) {
                  displayDisease = "정상";
                } else {
                  displayDisease = "뇌질환";
                }

                setRecentStatus(displayDisease);
                setLatestReport(latestReport);
                console.log("최근 상태 설정됨:", displayDisease);
              }
            } catch (error) {
              console.error("최근 리포트 분석 중 오류:", error);
            }
          } else {
            console.log("리포트 없음");
            setRecentStatus(null);
            setLatestReport(null);
          }
        } else {
          console.warn("최근 리포트 조회 실패:", response.status);
          setRecentStatus(null);
          setLatestReport(null);
        }
      } catch (error) {
        console.error("최근 리포트 조회 중 오류:", error);
        setRecentStatus(null);
        setLatestReport(null);
      }
    };

    fetchLatestReport();
  }, [wardId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("파일 선택됨:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
      });
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    console.log("=== 음성 업로드 시작 ===");
    console.log("wardId:", wardId);
    console.log("선택된 파일:", selectedFile?.name);
    console.log("파일 크기:", selectedFile?.size, "bytes");

    if (!selectedFile || !wardId) {
      console.error("오류: 파일이 선택되지 않았거나 wardId가 없음");
      setUploadError("파일을 선택하고 wardId가 설정되었는지 확인해주세요.");
      return;
    }

    setIsUploadingAudio(true);
    setUploadError(null);

    try {
      const formDataWithFile = new FormData();
      formDataWithFile.append("file", selectedFile);

      const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/audio-records/ward/${wardId}`;
      console.log("업로드 URL:", uploadUrl);
      console.log("요청 메서드: POST");
      console.log("요청 본문: FormData (파일)");

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formDataWithFile,
      });

      console.log("응답 상태 코드:", response.status);
      console.log("응답 상태 텍스트:", response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("응답 본문 (에러):", errorText);
        throw new Error("Failed to upload audio");
      }

      const result = await response.json();
      console.log("응답 본문 (성공):", result);

      const newRecordId = result.data?.recordId || result.data?.id;
      console.log("추출된 recordId:", newRecordId);

      if (newRecordId) {
        setRecordId(newRecordId);
        localStorage.setItem("recordId", newRecordId.toString());
        console.log("recordId를 localStorage에 저장함");

        // 새 리포트 업로드 시, 이전 리포트 상태 초기화
        setLatestReport(null);
        setHasCheckedReport(false);
        setShowAlert(false);
        setIsCheckingReport(false);
        localStorage.setItem("hasCheckedReport", "false");

        setShowUploadModal(false);
        setSelectedFile(null);

        // 업로드 완료 후 자가진단표 수정 팝업 표시 (AI 호출은 팝업에서 "넘어가기" 버튼을 눌렀을 때 실행)
        console.log("=== 음성 업로드 완료, 자가진단표 수정 팝업 표시 ===");
        setShowDiagnosisModal(true);
      }
    } catch (error) {
      console.error("업로드 중 에러 발생:", error);
      setUploadError("음성 파일 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const pollReportCompletion = async (recId: number) => {
    const maxAttempts = 600;
    const pollInterval = 2000;
    let attempts = 0;

    console.log("폴링 시작:", {
      recordId: recId,
      maxAttempts,
      pollInterval: `${pollInterval}ms`,
    });

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`\n[폴링 시도 ${attempts}/${maxAttempts}]`);

        const statusUrl = `${process.env.NEXT_PUBLIC_API_URL}/audio-records/${recId}`;
        console.log("상태 확인 URL:", statusUrl);

        const response = await fetch(statusUrl);
        console.log("응답 상태 코드:", response.status);

        if (!response.ok) {
          throw new Error("Failed to check record status");
        }

        const result = await response.json();
        console.log("응답 본문:", result);

        const status = result.data?.status;
        console.log("현재 상태:", status);

        if (status === "failed" || status === "error") {
          console.log("AI 응답 실패 상태 감지. 폴링 중단");
          setIsCheckingReport(false);
          setShowAlert(false);
          setShowConfirmModal(true);
          return;
        }

        if (status === "completed") {
          console.log("상태가 'completed'로 변경됨! 리포트 조회 중...");

          const reportUrl = `${process.env.NEXT_PUBLIC_API_URL}/reports/record/${recId}`;
          console.log("리포트 조회 URL:", reportUrl);

          const reportResponse = await fetch(reportUrl);
          console.log("리포트 응답 상태 코드:", reportResponse.status);

          if (reportResponse.ok) {
            const reportResult = await reportResponse.json();
            console.log("리포트 응답 본문:", reportResult);

            const report = reportResult.data || reportResult;
            console.log("최종 리포트 데이터:", report);

            setLatestReport(report);
            // 분석 결과에서 대표 질병(가장 높은 accuracy)을 계산하여 상태/로컬스토리지에 저장
            try {
              let analysisResult =
                (report as any).analysisResult ||
                (report as any).data?.analysisResult;

              if (typeof analysisResult === "string") {
                analysisResult = JSON.parse(analysisResult);
              }

              const accuracy: number[] | undefined = analysisResult?.accuracy;
              if (accuracy && Array.isArray(accuracy) && accuracy.length > 0) {
                const normalAccuracy = accuracy[2] || 0;
                const diseaseAccuracy = accuracy[0] || 0; // 뇌졸중
                const secondaryAccuracy = accuracy[1] || 0; // 퇴행성 뇌질환

                // 정상이 질병들보다 높으면 정상 표시, 아니면 뇌질환 표시
                const isNormalHighest =
                  normalAccuracy >= diseaseAccuracy &&
                  normalAccuracy >= secondaryAccuracy;

                let displayDisease: string;
                if (isNormalHighest) {
                  displayDisease = "정상";
                } else {
                  displayDisease = "뇌질환";
                }

                setRecentStatus(displayDisease);
                if (typeof window !== "undefined") {
                  localStorage.setItem("latestDiseaseName", displayDisease);
                }
              }
            } catch (error) {
              console.error("홈 화면 대표 질병 계산 중 오류:", error);
            }

            // AI 처리 완료 후 분석 결과 확인 모달 표시
            setIsCheckingReport(false);
            setShowConfirmModal(true);
            console.log("=== AI 처리 완료, 분석 결과 확인 모달 표시 ===");
            return;
          } else {
            console.warn("리포트 조회 실패:", reportResponse.status);
            // 리포트 조회 실패 시 폴링 중단
            setIsCheckingReport(false);
            setShowAlert(false);
            setShowConfirmModal(true);
            return;
          }
        } else {
          console.log(`대기 중... (${pollInterval}ms 후 재시도)`);
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error(`폴링 시도 ${attempts}에서 에러 발생:`, error);
      }
    }

    console.log("타임아웃: 최대 시도 횟수 도달");
    setIsCheckingReport(false);
    setShowAlert(false);
    setShowConfirmModal(true);
  };

  const headerContent = (
    <div className="flex items-center justify-between px-6 pt-4 pb-2 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2">
        <Image
          src="/icons/home/home-logo.svg"
          alt="어느날 로고"
          width={71}
          height={35}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="p-0"
          onClick={() => router.push("/mypage")}
        >
          <Image
            src="/icons/home/home-mypage.svg"
            alt="마이페이지"
            width={20}
            height={20}
          />
        </Button>
        <Button variant="ghost" size="icon" className="p-0 relative">
          <Image
            src="/icons/home/home-alarm.svg"
            alt="알림"
            width={20}
            height={22}
          />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive-foreground rounded-full"></span>
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout hasHeader={true} headerContent={headerContent}>
      <div className="px-6 py-4 space-y-4 max-w-md mx-auto w-full">
        {showAlert && (
          <Card
            className={`border-0 p-5 rounded-md shadow-none relative ${
              isReportReady ? "bg-primary" : "bg-white"
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 h-6 w-6 rounded-md shadow-none ${
                isReportReady ? "text-white" : "text-muted-foreground"
              }`}
              onClick={() => setShowAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="text-center space-y-0">
              {!isReportReady ? (
                <>
                  <h3 className="font-semibold text-lg text-primary leading-tight">
                    상세 분석 리포트를 준비중이에요!
                  </h3>
                  <p className="text-base text-muted-foreground leading-tight">
                    조금만 기다려 주시면 금방 준비 돼요
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg text-white leading-tight">
                    상세 분석 리포트가 준비 됐어요!
                  </h3>
                  <p className="text-base text-white/80 leading-tight">
                    지금 확인하러 가볼까요?
                  </p>
                </>
              )}
            </div>
          </Card>
        )}

        <Card className="bg-card border-0 p-5 rounded-md shadow-none">
          <div className="text-center">
            <p style={{ fontSize: "14px", color: "#979EA1" }}>최근 결과</p>
            <div style={{ marginTop: "5px" }}>
              {recentStatus ? (
                <>
                  <h2 style={{ fontSize: "20px", color: "#303233" }}>
                    최근 {userName ? `${userName}님의` : ""} 상태는
                  </h2>
                  <h2 className="font-bold" style={{ fontSize: "28px" }}>
                    {recentStatus === "정상" ? (
                      <>
                        <span className="text-primary">정상</span>
                        <span style={{ color: "#303233" }}>이에요</span>
                      </>
                    ) : (
                      <>
                        <span className="text-primary">{recentStatus}</span>
                        <span style={{ color: "#303233" }}>이 의심돼요</span>
                      </>
                    )}
                  </h2>
                </>
              ) : (
                <h2
                  className="font-bold"
                  style={{ fontSize: "20px", color: "#303233" }}
                >
                  새로운 레포트를 생성해보세요
                </h2>
              )}
            </div>

            <div
              className="flex justify-center"
              style={{ marginTop: "5px", marginLeft: "8px" }}
            >
              <Image
                src="/icons/list/list-call.svg"
                alt="경고"
                width={162}
                height={126}
              />
            </div>

            {recentStatus && recentStatus !== "정상" && (
              <Link href="/report">
                <Card
                  className="bg-destructive border-0 p-3.5 rounded-md cursor-pointer hover:opacity-90 transition-opacity shadow-none"
                  style={{ marginTop: "5px" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium text-destructive-foreground">
                      주의 할 내용
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-destructive-foreground">
                        {alertCount}건
                      </span>
                      <ChevronRight className="h-4 w-4 text-destructive-foreground" />
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </div>
        </Card>

        <Card className="bg-card border-0 p-5 rounded-md shadow-none">
          <div className="text-center">
            <p style={{ fontSize: "14px", color: "#979EA1" }}>뇌질환 확인</p>
            <div style={{ marginTop: "5px" }}>
              <p style={{ fontSize: "20px", color: "#303233" }}>
                {userName ? `${userName}님과의` : ""} 통화로
              </p>
              <p className="font-bold" style={{ fontSize: "28px" }}>
                <span className="text-primary">위험도</span>
                <span style={{ color: "#303233" }}>를 알아봐요</span>
              </p>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-none text-base mt-5"
            >
              업로드하기
            </Button>
          </div>
        </Card>
      </div>

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

                {!selectedFile && (
                  <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a"
                      onChange={handleFileChange}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
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
                )}

                {selectedFile && (
                  <div className="bg-muted p-3 rounded-md flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate overflow-hidden">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                      className="h-6 w-6 rounded-md shadow-none ml-2 shrink-0"
                      title="파일 취소"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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

      {showDiagnosisModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-sm p-8 rounded-md shadow-none space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold text-foreground">
                자가진단표를 수정할까요?
              </h2>
              <p className="text-sm text-muted-foreground">
                더 정확한 진단을 위해 자가진단 결과를 수정해보세요.
              </p>
            </div>

            <div className="bg-[#F5F8FE] p-6 rounded-md border border-[#D0DCFF]">
              <p className="text-sm text-[#5A6F8F] text-center">
                자가진단표를 수정하고 저장하면, 새로운 분석 결과를 받을 수
                있습니다.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => {
                  setShowDiagnosisModal(false);
                  localStorage.setItem("showSelfDiagnosis", "true");
                  router.push("/self-diagnosis");
                }}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-none text-base"
              >
                수정하기
              </Button>
              <Button
                onClick={() => {
                  setShowDiagnosisModal(false);
                  setShowAlert(true);
                  setIsCheckingReport(true);
                  console.log(
                    "=== 자가진단표 수정 스킵, AI 처리 대기 시작 ===",
                  );
                  if (recordId) {
                    pollReportCompletion(recordId);
                  }
                }}
                variant="outline"
                className="w-full h-12 border-[#D0DCFF] text-primary hover:bg-[#F5F8FE] font-semibold rounded-full shadow-none text-base"
              >
                넘어가기
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-sm p-8 rounded-md shadow-none">
            {isCheckingReport ? (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                  <h2 className="text-lg font-semibold text-foreground text-center">
                    AI가 분석중이에요
                  </h2>
                  <p className="text-sm text-muted-foreground text-center">
                    잠시만 기다려주세요...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    분석이 완료되었어요!
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    레포트를 확인해보세요
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-full shadow-none text-base"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setShowAlert(false);
                      if (recordId) {
                        localStorage.setItem(
                          "currentReportRecordId",
                          recordId.toString(),
                        );
                      }
                      // 리포트 확인 시, 준비중 배너는 다시 보이지 않도록 상태 저장
                      setHasCheckedReport(true);
                      localStorage.setItem("hasCheckedReport", "true");
                      router.push("/report");
                    }}
                  >
                    레포트 확인
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-foreground font-medium rounded-full shadow-none text-base"
                    onClick={() => {
                      setShowConfirmModal(false);
                    }}
                  >
                    나중에
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
