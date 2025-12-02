"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { wardAPI, audioAPI } from "@/lib/api";

type WardFormData = {
  name: string;
  gender: "male" | "female" | "";
  birthDate: string;
  relationship: string;
};

const calculateAge = (birthDate: string) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

const DUMMY_GUARDIAN = {
  id: 1,
  phone: "010-0000-0000",
};

import Step1 from "@/components/landing/Step1";
import Step2 from "@/components/landing/Step2";
import Step3 from "@/components/landing/Step3";
import Step4 from "@/components/landing/Step4";
import Step5 from "@/components/landing/Step5";
import Step6 from "@/components/landing/Step6";
import Step7 from "@/components/landing/Step7";

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  // Step 3 폼 데이터
  const [formData, setFormData] = useState<WardFormData>({
    name: "",
    gender: "",
    birthDate: "",
    relationship: "",
  });

  // Step 3 ward 정보
  const [wardId, setWardId] = useState<number | null>(null);

  // Step 3 상태
  const [wardSubmissionError, setWardSubmissionError] = useState<string | null>(
    null,
  );
  const [isCreatingWard, setIsCreatingWard] = useState(false);

  // Step 4 상태
  const [isUpdatingDiagnosis, setIsUpdatingDiagnosis] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);

  // 업로드/레코드 상태
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);

  // Step 4 설문 답변 (20개 질문, 각 0-4 값, 초기값 0)
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>(
    Array(20).fill(0),
  );

  // 자동 진행 (Step 1, 2는 3초 후 자동 진행)
  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Step 7 이후 자동으로 리포트 페이지로 이동
  useEffect(() => {
    if (currentStep === 7) {
      const timer = setTimeout(() => {
        router.push("/report");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // 사용자 이름 저장
      if (field === "name" && typeof window !== "undefined") {
        localStorage.setItem("userName", value);
      }
      return updated;
    });
    setWardSubmissionError(null);
  };

  const handleWardSubmit = async () => {
    if (!formData.name || !formData.gender || !formData.birthDate) {
      return;
    }

    if (isCreatingWard) return;

    setIsCreatingWard(true);
    setWardSubmissionError(null);

    try {
      const age = calculateAge(formData.birthDate);
      const payload = {
        guardianId: DUMMY_GUARDIAN.id,
        name: formData.name,
        birthDate: formData.birthDate,
        age,
        gender: formData.gender as "male" | "female",
        phone: DUMMY_GUARDIAN.phone,
        relationship: formData.relationship,
        diagnosis: JSON.stringify({
          source: "onboarding",
          relationship: formData.relationship,
        }),
      };

      const response = await wardAPI.createWard(payload);
      const createdWardId = response?.wardId ?? response?.id ?? null;

      if (createdWardId) {
        setWardId(createdWardId);
        if (typeof window !== "undefined") {
          localStorage.setItem("wardId", String(createdWardId));
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("wardProfile", JSON.stringify(payload));
      }

      setCurrentStep(4);
    } catch (error) {
      console.error("피보호자 등록 중 오류 발생:", error);
      const message =
        error instanceof Error
          ? error.message
          : "피보호자 등록에 실패했습니다.";
      setWardSubmissionError(message);
    } finally {
      setIsCreatingWard(false);
    }
  };

  const handleSurveyAnswerChange = (questionIndex: number, value: number) => {
    setSurveyAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = value;
      // 설문 답변 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("surveyAnswers", JSON.stringify(newAnswers));
      }
      return newAnswers;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    handleAudioUpload();
  };

  const handleSkip = () => {
    router.push("/"); // "나중에할래요" 클릭 시 메인 페이지로 이동
  };

  const handleStep4Next = async () => {
    if (!wardId) {
      setDiagnosisError("Ward ID가 없습니다.");
      return;
    }

    if (!canProceedFromStep4 || isUpdatingDiagnosis) {
      return;
    }

    setIsUpdatingDiagnosis(true);
    setDiagnosisError(null);

    try {
      // 설문 질문 정의
      const questions = [
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

      // 질문과 답변을 배열로 생성
      const questionAnswerPairs = questions.map((question, index) => ({
        text: question,
        answer: surveyAnswers[index],
      }));

      // 설문 답변을 diagnosis JSON으로 포맷팅
      const diagnosisData = {
        answered: true,
        completedAt: new Date().toISOString(),
        questions: questionAnswerPairs,
      };

      await wardAPI.updateDiagnosis(wardId, diagnosisData);

      // 설문 답변 제출 완료, 다음 단계로 이동
      setCurrentStep(5);
    } catch (error) {
      console.error("자가진단 업데이트 중 오류 발생:", error);
      const message =
        error instanceof Error
          ? error.message
          : "자가진단 저장에 실패했습니다.";
      setDiagnosisError(message);
    } finally {
      setIsUpdatingDiagnosis(false);
    }
  };

  const handleAudioUpload = async () => {
    if (!selectedFile || !wardId) {
      setUploadError("파일과 피보호자 정보가 모두 필요합니다.");
      return;
    }

    setIsUploadingAudio(true);
    setUploadError(null);

    try {
      const result = await audioAPI.uploadAudio(wardId, selectedFile);
      const newRecordId =
        // 다양한 응답 형태 대응
        (result as any).data?.recordId ??
        (result as any).data?.id ??
        (result as any).recordId ??
        (result as any).id ??
        null;

      if (newRecordId) {
        setRecordId(newRecordId);
        if (typeof window !== "undefined") {
          localStorage.setItem("recordId", String(newRecordId));
        }
      }

      setShowUploadModal(false);
      setSelectedFile(null);
      setCurrentStep(6);
    } catch (error) {
      console.error("음성 업로드 실패:", error);
      const message =
        error instanceof Error
          ? error.message
          : "음성 파일 업로드에 실패했습니다. 다시 시도해주세요.";
      setUploadError(message);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const pollReportCompletion = async (recId: number): Promise<boolean> => {
    try {
      const result = await audioAPI.getRecordById(recId);
      const status =
        (result as any).data?.status ??
        (result as any).status ??
        (result as any).record?.status ??
        null;

      if (status) {
        console.log("현재 레코드 상태:", status);
      }

      return status === "completed";
    } catch (error) {
      console.error("리포트 상태 확인 중 오류 발생:", error);
      return false;
    }
  };

  const canProceedFromStep3 =
    formData.name &&
    formData.gender &&
    formData.birthDate &&
    formData.relationship;
  const canProceedFromStep4 = surveyAnswers.every((answer) => answer !== -1);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Step 1 */}
      {currentStep === 1 && <Step1 />}

      {/* Step 2 */}
      {currentStep === 2 && <Step2 />}

      {/* Step 3 */}
      {currentStep === 3 && (
        <div className="relative min-h-dvh">
          <Step3
            formData={formData}
            onFormChange={handleFormChange}
            isSubmitting={isCreatingWard}
            errorMessage={wardSubmissionError}
          />
          <div className="absolute bottom-8 left-0 right-0 px-4 max-w-md mx-auto">
            <Button
              onClick={handleWardSubmit}
              disabled={!canProceedFromStep3 || isCreatingWard}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-none disabled:opacity-50 text-base"
            >
              {isCreatingWard ? "등록 중..." : "다음"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {currentStep === 4 && (
        <div className="relative min-h-dvh overflow-y-auto">
          <Step4
            userName={formData.name}
            surveyAnswers={surveyAnswers}
            onAnswerChange={handleSurveyAnswerChange}
          />
          <div className="sticky bottom-0 bg-white px-4 py-4 max-w-md mx-auto">
            <Button
              onClick={handleStep4Next}
              disabled={!canProceedFromStep4 || isUpdatingDiagnosis}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-none disabled:opacity-50 text-base"
            >
              {isUpdatingDiagnosis ? "저장 중..." : "다음"}
            </Button>
            {diagnosisError && (
              <p className="mt-2 text-center text-sm text-red-500">
                {diagnosisError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 5 */}
      {currentStep === 5 && (
        <Step5
          userName={formData.name}
          onUpload={() => setShowUploadModal(true)}
          onSkip={handleSkip}
        />
      )}

      {/* Step 6 */}
      {currentStep === 6 && (
        <Step6
          recordId={recordId}
          onNext={() => setCurrentStep(7)}
          onPoll={pollReportCompletion}
        />
      )}

      {/* Step 7 */}
      {currentStep === 7 && <Step7 />}

      {/* 업로드 모달 */}
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
                    <p className="text-sm font-medium text-foreground truncate overflow-hidden">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {uploadError}
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
    </div>
  );
}
