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
  const [showAlert, setShowAlert] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [isCheckingReport, setIsCheckingReport] = useState(false);
  const [latestReport, setLatestReport] = useState<any>(null);
  const router = useRouter();

  // 예시 데이터
  const [userName, setUserName] = useState("옥순");
  const daysWithoutCall = 10;
  const [recentStatus, setRecentStatus] = useState("뇌졸중");
  const alertCount = 3;

  // wardId와 최신 리포트 로드
  useEffect(() => {
    console.log("=== 홈 페이지 초기화 ===");
    if (typeof window !== "undefined") {
      const storedWardId = localStorage.getItem("wardId");
      const storedUserName = localStorage.getItem("userName");

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
    }
  }, []);

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

        setShowUploadModal(false);
        setSelectedFile(null);

        console.log("=== AI 처리 대기 시작 ===");
        setIsCheckingReport(true);
        await pollReportCompletion(newRecordId);
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
            setShowConfirmModal(true);
            setIsCheckingReport(false);
            console.log("=== AI 처리 완료 ===");
            return;
          } else {
            console.warn("리포트 조회 실패:", reportResponse.status);
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
        <Button variant="ghost" size="icon" className="p-0">
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
      <div className="px-4 py-4 space-y-4 max-w-md mx-auto w-full">
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
              <h2 style={{ fontSize: "20px", color: "#303233" }}>
                최근 {userName}님의 상태는
              </h2>
              <h2 className="font-bold" style={{ fontSize: "28px" }}>
                <span className="text-primary">{recentStatus}</span>
                <span style={{ color: "#303233" }}>이 의심돼요</span>
              </h2>
            </div>

            <div
              className="flex justify-center"
              style={{ marginTop: "5px", marginLeft: "8px" }}
            >
              <Image
                src="/icons/home/home-warning.svg"
                alt="경고"
                width={162}
                height={126}
              />
            </div>

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
          </div>
        </Card>

        <Card className="bg-card border-0 p-5 rounded-md shadow-none">
          <div className="text-center">
            <p style={{ fontSize: "14px", color: "#979EA1" }}>뇌질환 확인</p>
            <div style={{ marginTop: "5px" }}>
              <p style={{ fontSize: "20px", color: "#303233" }}>
                {userName}님과의 통화로
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

        <Link href="/list">
          <Card className="bg-card border-0 p-5 rounded-md shadow-none cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{ fontSize: "14px", color: "#979EA1" }}
                  className="mb-1"
                >
                  이전 분석 기록
                </p>
                <p
                  className="font-semibold"
                  style={{ fontSize: "16px", color: "#303233" }}
                >
                  레포트 보기
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
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
                  }}
                  className="h-8 w-8 rounded-md shadow-none"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
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

                {selectedFile && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-full disabled:opacity-50 shadow-none text-base"
                >
                  업로드
                </Button>
              </div>
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
                      if (recordId) {
                        localStorage.setItem(
                          "currentReportRecordId",
                          recordId.toString(),
                        );
                      }
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
