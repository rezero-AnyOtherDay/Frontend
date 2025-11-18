'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'

export default function ReportPage() {
  const router = useRouter()

  const headerContent = (
    <div className="px-4 py-3 max-w-md mx-auto">
      <button onClick={() => router.push('/list')} className="text-foreground">
        <ChevronLeft className="w-6 h-6" />
      </button>
    </div>
  )

  return (
    <AppLayout hasHeader={true} headerContent={headerContent}>
      <div className="px-4 py-4 max-w-md mx-auto w-full">
        {/* Main Result */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">
            옥순님이 문제 없음일 확률은
          </h1>
          <p className="text-3xl font-bold text-[#4291F2]">35%입니다.</p>
        </div>

        {/* Results Summary Card */}
        <div className="bg-white p-5 rounded mb-4">
          <p className="text-sm text-foreground mb-3">
            뇌졸중일 확률은 <span className="font-semibold">00%</span>, 퇴행성
            뇌질환일 확률은 <span className="font-semibold">00%</span>, 문제 없음일
            확률은 <span className="font-semibold">00%</span>입니다.
          </p>
          <p className="text-sm text-foreground mb-4">
            작성하신 문진표 분석 결과 치매 문진표{' '}
            <span className="font-semibold">00개</span> 체크리스트 중{' '}
            <span className="font-semibold">00개</span>가 해당하므로 중증으로
            추정됩니다.
          </p>

          {/* Integrated Results Table */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-[#4291F2] mb-3">통합 결과</h3>
            <div className="border border-gray-300">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3 text-center font-medium border-r border-gray-300">
                      위험도
                    </th>
                    <th className="py-2 px-3 text-center font-medium border-r border-gray-300">
                      신뢰도
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 px-3 border-r border-gray-300">뇌졸중</td>
                    <td className="py-2 px-3 text-center border-r border-gray-300">
                      <span className="inline-block bg-yellow-400 text-white text-xs px-2 py-1 rounded">
                        관심
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">00%</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 px-3 border-r border-gray-300">치매</td>
                    <td className="py-2 px-3 text-center border-r border-gray-300">
                      <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        주의
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">00%</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 px-3 border-r border-gray-300">파킨슨병</td>
                    <td className="py-2 px-3 text-center border-r border-gray-300">
                      <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded">
                        위험
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">00%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-gray-300">우울/불안</td>
                    <td className="py-2 px-3 text-center border-r border-gray-300">
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded">
                        정상
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">00%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              *본 표의 위험도는 문진표, 신뢰도는 음성 기반으로 측정됩니다.
            </p>
          </div>
        </div>

        {/* High Risk Disease Card - 뇌졸중 */}
        <div className="bg-white p-5 rounded mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-full mb-2">
                위험도 높음
              </span>
              <h3 className="text-lg font-bold text-foreground">뇌졸중</h3>
            </div>
          </div>
          <ul className="text-sm text-foreground space-y-2 mb-4 list-disc pl-5">
            <li>
              뇌혈관이 막히거나 터져서 생기는 질환으로, 말이 꼬이거나 한쪽
              이상에만는 증상이 특징적일 수 있습니다.
            </li>
            <li>
              말소·고혈압, 당뇨, 심장질환이 있으면 위험이 높아집니다.
            </li>
            <li>
              신경학적인 증상(어지럼증, 보행 장애 등)이 나타난 경험이 최근에
              있어 농림드로 유의하십시오.
            </li>
          </ul>
          <button
            onClick={() => router.push('/?tab=consultation')}
            className="w-full bg-[#4291F2] text-white py-3 rounded font-medium"
          >
            상담하러가기
          </button>
        </div>

        {/* Warning Disease Card - 치매 */}
        <div className="bg-white p-5 rounded mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded-full mb-2">
                위험도 주의
              </span>
              <h3 className="text-lg font-bold text-foreground">치매</h3>
            </div>
          </div>
          <ul className="text-sm text-foreground space-y-2 list-disc pl-5">
            <li>
              기억력이나 판단력이 떨어지면서 일상생활에 어려움이 생길 수 있는
              뇌 질환입니다.
            </li>
            <li>
              초기에는 "같은말이 반복"이 있다면, "같은 말 반복"지침 인지
              지체를 관찰해 나십시오.
            </li>
            <li>
              어떤 코드는 음성 분석에서 약한 위낙·자기고립으로서나 기저력
              관련 문장열법 제도가 관찰될 결과입니다.
            </li>
          </ul>
        </div>
      </div>

      {/* Recommended Follow-up Actions Section */}
      <div className="bg-[#4291F2] px-4 py-8 max-w-md mx-auto w-full">
        <h2 className="text-xl font-bold text-white text-center mb-6">
          권장 후속조치
        </h2>

        {/* Re-measure Card */}
        <div className="bg-white p-5 rounded mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3 text-center">
            다시 측정하기
          </h3>
          <p className="text-sm text-foreground text-center mb-4">
            2주~1개월 내 음성으로 다시 입으로 → 경향성 확인
            <br />
            서비스 분석화가 이어진 리포트 기반 체계적으로 모든 관찰
          </p>
          <button className="w-full bg-[#4291F2] text-white py-3 rounded font-medium">
            2주 뒤 알림 신청
          </button>
        </div>

        {/* Additional Test Card */}
        <div className="bg-white p-5 rounded mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3 text-center">
            추가 테스트
          </h3>
          <p className="text-sm text-foreground text-center mb-4">
            서대그리카(CDI)
            <br />
            간단한 자가기저테스트(숫자 자구로 받힘기)
          </p>
          <button className="w-full bg-[#4291F2] text-white py-3 rounded font-medium">
            테스트 하러가기
          </button>
        </div>

        {/* Expert Connection Card */}
        <div className="bg-white p-5 rounded mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3 text-center">
            전문가 연결하기
          </h3>
          <button
            onClick={() => router.push('/?tab=consultation')}
            className="w-full bg-[#4291F2] text-white py-3 rounded font-medium"
          >
            상담하러가기
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
