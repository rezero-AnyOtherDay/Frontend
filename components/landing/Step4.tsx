"use client";

import Image from "next/image";

interface Step4Props {
  userName: string;
  surveyAnswers: number[];
  onAnswerChange: (questionIndex: number, value: number) => void;
}

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

const scaleLabels = ["매우 아니다", "아니다", "보통", "그렇다", "매우 그렇다"];

// 버튼 크기 설정
const getButtonSize = (value: number) => {
  if (value === 0 || value === 4) {
    // 매우 아니다, 매우 그렇다 - 현재 크기
    return "h-12 w-12";
  } else if (value === 1 || value === 3) {
    // 아니다, 그렇다 - 살짝 작은 크기
    return "h-10 w-10";
  } else {
    // 보통 - 더 작은 크기
    return "h-8 w-8";
  }
};

export default function Step4({
  userName,
  surveyAnswers,
  onAnswerChange,
}: Step4Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white px-4 py-12 max-w-md mx-auto">
      <h1 className="mb-8 text-center text-2xl font-bold text-[#9AA5BE]">
        요즘 {userName}님의 상태는 어떤가요?
      </h1>

      <div className="w-full space-y-6">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex}>
            {questionIndex > 0 && (
              <div className="border-t border-gray-300 mb-6"></div>
            )}
            <div className="space-y-8">
              <p className="text-base font-medium text-gray-700 leading-tight">
                {questionIndex + 1}. {question}
              </p>

              <div className="flex items-center justify-between gap-2">
                {[0, 1, 2, 3, 4].map((value) => {
                  const isSelected = surveyAnswers[questionIndex] === value;
                  const sizeClass = getButtonSize(value);

                  return (
                    <button
                      key={value}
                      onClick={() => onAnswerChange(questionIndex, value)}
                      className="group relative flex flex-col items-center"
                    >
                      <div className={`relative ${sizeClass} transition-all`}>
                        <Image
                          src={
                            isSelected
                              ? "/icons/landing/landing-survey-fill.svg"
                              : "/icons/landing/landing-survey.svg"
                          }
                          alt={scaleLabels[value]}
                          fill
                          className="object-contain opacity-100"
                        />
                      </div>
                      <span className="mt-2 text-xs text-gray-600 text-center">
                        {scaleLabels[value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
