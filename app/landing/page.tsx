"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
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
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    relationship: "",
  });

  // Step 4 설문 답변 (5개 질문, 각 0-4 값)
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([-1, -1, -1, -1, -1]);

  // 자동 진행 (Step 1, 2는 3초 후 자동 진행)
  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Step 7 이후 자동으로 메인 페이지로 이동
  useEffect(() => {
    if (currentStep === 7) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSurveyAnswerChange = (questionIndex: number, value: number) => {
    setSurveyAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = value;
      return newAnswers;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      setShowUploadModal(false);
      setCurrentStep(6); // 업로드 후 Step 6으로 이동
    }
  };

  const handleSkip = () => {
    router.push("/"); // "나중에할래요" 클릭 시 메인 페이지로 이동
  };

  const canProceedFromStep3 = formData.name && formData.gender && formData.birthDate && formData.relationship;
  const canProceedFromStep4 = surveyAnswers.every((answer) => answer !== -1);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Step 1 */}
      {currentStep === 1 && <Step1 />}

      {/* Step 2 */}
      {currentStep === 2 && <Step2 />}

      {/* Step 3 */}
      {currentStep === 3 && (
        <div className="relative h-screen">
          <Step3 formData={formData} onFormChange={handleFormChange} />
          <div className="absolute bottom-8 left-0 right-0 px-8">
            <Button
              onClick={() => setCurrentStep(4)}
              disabled={!canProceedFromStep3}
              className="w-full bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {currentStep === 4 && (
        <div className="relative h-screen overflow-y-auto">
          <Step4
            userName={formData.name}
            surveyAnswers={surveyAnswers}
            onAnswerChange={handleSurveyAnswerChange}
          />
          <div className="sticky bottom-0 bg-white px-8 py-4">
            <Button
              onClick={() => setCurrentStep(5)}
              disabled={!canProceedFromStep4}
              className="w-full bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Step 5 */}
      {currentStep === 5 && (
        <Step5
          onUpload={() => setShowUploadModal(true)}
          onSkip={handleSkip}
        />
      )}

      {/* Step 6 */}
      {currentStep === 6 && (
        <div className="relative h-screen">
          <Step6 />
          <div className="absolute bottom-8 left-0 right-0 px-8">
            <Button
              onClick={() => setCurrentStep(7)}
              className="w-full bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Step 7 */}
      {currentStep === 7 && <Step7 />}

      {/* 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm rounded bg-white p-6">
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
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="rounded border-2 border-dashed border-border p-8 text-center">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a"
                    onChange={handleFileChange}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="flex cursor-pointer flex-col items-center gap-3"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        파일을 선택하세요
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        MP3, WAV, M4A 형식 지원
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <div className="rounded bg-muted p-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="w-full rounded bg-primary py-3 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  업로드
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
