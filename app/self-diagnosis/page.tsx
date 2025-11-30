"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Step4 from "@/components/landing/Step4";
import { wardAPI } from "@/lib/api";

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

export default function SelfDiagnosisPage() {
  const router = useRouter();
  // Step 4 설문 답변 (20개 질문, 각 0-4 값)
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>(
    Array(20).fill(2)
  );
  // 사용자 이름 (localStorage에서 가져오거나 기본값)
  const [userName, setUserName] = useState("");
  const [wardId, setWardId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // localStorage에서 이전 설문 답변 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAnswers = localStorage.getItem("surveyAnswers");
      const savedName = localStorage.getItem("userName");
      const savedWardId = localStorage.getItem("wardId");

      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          if (Array.isArray(parsed) && parsed.length === 20) {
            setSurveyAnswers(parsed);
          }
        } catch (e) {
          console.error("Failed to parse saved survey answers", e);
        }
      }

      if (savedName) {
        setUserName(savedName);
      }

      if (savedWardId) {
        setWardId(parseInt(savedWardId));
      }
    }
  }, []);

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

  const handleSubmit = async () => {
    if (!wardId) {
      setSubmitError("Ward ID가 없습니다.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
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

      console.log("[Self-Diagnosis] Updated successfully:", diagnosisData);
      router.push("/list");
    } catch (error) {
      console.error("자가진단 업데이트 중 오류 발생:", error);
      const message =
        error instanceof Error ? error.message : "자가진단 업데이트에 실패했습니다.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = surveyAnswers.every((answer) => answer !== -1);

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative min-h-screen w-full max-w-md bg-background">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">
              자가진단표 수정
            </h1>
          </div>
        </header>

        {/* Step4 설문 컴포넌트 */}
        <div className="relative min-h-[calc(100vh-72px)] overflow-y-auto">
          <Step4
            userName={userName}
            surveyAnswers={surveyAnswers}
            onAnswerChange={handleSurveyAnswerChange}
          />

          {/* 하단 고정 버튼 */}
          <div className="sticky bottom-0 border-t bg-white/95 backdrop-blur px-4 py-4">
            {submitError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {submitError}
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full disabled:opacity-50 shadow-none text-base"
            >
              {isSubmitting ? "저장 중..." : "수정 완료"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
