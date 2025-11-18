"use client";

interface Step4Props {
  userName: string;
  surveyAnswers: number[];
  onAnswerChange: (questionIndex: number, value: number) => void;
}

const questions = [
  "옷 단추를 잠그기 힘들거나 젓가락을 사용하기 어렵다",
  "물건을 사거나 요금을 지불하는 것이 어렵다",
  "집안일을 하거나 취미 활동을 하기 어렵다",
  "대화 중 단어를 떠올리기 어렵거나 말이 막힌다",
  "오늘 날짜나 요일을 기억하기 어렵다",
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
      <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
        요즘 {userName}님의 상태는 어떤가요?
      </h1>

      <div className="w-full space-y-8">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="space-y-4">
            <p className="text-base font-medium text-gray-700">
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
                    <div
                      className={`relative ${sizeClass} rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? "bg-[#FFD86D] border-[#FFD86D]"
                          : "bg-transparent border-[#FFD86D]"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isSelected ? "text-gray-800" : "text-[#FFD86D]"
                        }`}
                      >
                        {value + 1}
                      </span>
                    </div>
                    <span className="mt-2 text-xs text-gray-600 text-center">
                      {scaleLabels[value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
