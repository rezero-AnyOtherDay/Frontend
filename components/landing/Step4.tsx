"use client";

import Image from "next/image";

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

export default function Step4({ userName, surveyAnswers, onAnswerChange }: Step4Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white px-8 py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
        요즘 {userName}님의 상태는 어떤가요?
      </h1>

      <div className="mx-auto w-full max-w-2xl space-y-8">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="space-y-4">
            <p className="text-base font-medium text-gray-700">
              {questionIndex + 1}. {question}
            </p>

            <div className="flex items-center justify-between gap-2">
              {[0, 1, 2, 3, 4].map((value) => (
                <button
                  key={value}
                  onClick={() => onAnswerChange(questionIndex, value)}
                  className="group relative flex flex-col items-center"
                >
                  <div className="relative h-12 w-12">
                    <Image
                      src="/icons/landing/landing-survey.svg"
                      alt={scaleLabels[value]}
                      fill
                      className={`object-contain transition-all ${
                        surveyAnswers[questionIndex] === value
                          ? "opacity-100"
                          : "opacity-30 grayscale"
                      }`}
                    />
                  </div>
                  <span className="mt-2 text-xs text-gray-600">
                    {scaleLabels[value]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
