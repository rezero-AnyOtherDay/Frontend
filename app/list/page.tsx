'use client'

import { useState } from 'react'
import { ChevronRight, Phone, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'

export default function ListPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'integrated' | 'self-diagnosis'>(
    'integrated'
  )
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      setShowUploadModal(false)
      // Navigate to self-diagnosis confirmation
      router.push('/')
    }
  }

  // Sample report data grouped by month
  const reportsByMonth = [
    {
      month: '2025. 08',
      reports: [
        {
          id: 1,
          date: '2025.08.05(화)',
          status: '저녁',
          alert: '주의 필요!',
          summary: '통화내용 한줄요약',
        },
        {
          id: 2,
          date: '2025.08.05(화)',
          status: '저녁',
          alert: '주의 필요!',
          summary: '통화내용 한줄요약',
        },
      ],
    },
    {
      month: '2025. 07',
      reports: [
        {
          id: 3,
          date: '2025.07.05(화)',
          status: '저녁',
          alert: null,
          summary: '통화내용 한줄요약',
        },
      ],
    },
  ]

  const headerContent = (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-4">
        옥순 님의 뇌건강
      </h1>

      {/* Tabs */}
      <div className="flex gap-6">
        <button
          onClick={() => setActiveTab('integrated')}
          className={`pb-2 ${
            activeTab === 'integrated'
              ? 'text-[#4291F2] border-b-2 border-[#4291F2] font-semibold'
              : 'text-[#979EA1]'
          }`}
        >
          통합 분석
        </button>
        <button
          onClick={() => setActiveTab('self-diagnosis')}
          className={`pb-2 ${
            activeTab === 'self-diagnosis'
              ? 'text-[#4291F2] border-b-2 border-[#4291F2] font-semibold'
              : 'text-[#979EA1]'
          }`}
        >
          자가진단표
        </button>
      </div>
    </div>
  )

  return (
    <AppLayout hasHeader={true} headerContent={headerContent}>
      <div className="px-4 py-4 max-w-md mx-auto w-full space-y-6">
        {activeTab === 'integrated' && (
          <>
            {/* Upload Section */}
            <div className="bg-white p-6 rounded mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Phone className="w-16 h-16 text-[#4291F2]" strokeWidth={1.5} />
                  <Heart
                    className="w-8 h-8 text-[#FFD86D] absolute -top-1 -right-2"
                    fill="#FFD86D"
                  />
                </div>
              </div>
              <p className="text-center text-foreground mb-4">
                옥순님과의 통화를 들려주세요
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full bg-[#4291F2] text-white py-3 rounded font-medium"
              >
                업로드하기
              </button>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {reportsByMonth.map((monthGroup) => (
                <div key={monthGroup.month}>
                  <h2 className="text-sm text-[#979EA1] mb-3 font-medium">
                    {monthGroup.month}
                  </h2>
                  <div className="space-y-3">
                    {monthGroup.reports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => router.push('/report')}
                        className="bg-white p-4 rounded cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#979EA1]">
                            {report.date}
                          </span>
                          <span className="text-sm text-[#979EA1]">
                            {report.status}
                          </span>
                        </div>
                        {report.alert && (
                          <p className="text-sm text-red-500 font-medium mb-1">
                            {report.alert}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-base text-foreground font-medium">
                            {report.summary}
                          </p>
                          <ChevronRight className="w-5 h-5 text-[#979EA1]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'self-diagnosis' && (
          <div className="bg-white p-6 rounded">
            <p className="text-center text-foreground">
              자가진단표 내용이 여기에 표시됩니다.
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">
              음성 녹음 파일 업로드
            </h2>
            <p className="text-sm text-foreground/70 mb-4">
              통화 녹음 파일을 선택해주세요
            </p>

            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-[#4291F2] transition-colors">
                <div className="text-center">
                  <p className="text-sm text-[#979EA1] mb-2">
                    {selectedFile ? selectedFile.name : '파일을 선택하세요'}
                  </p>
                  <p className="text-xs text-[#979EA1]">MP3, WAV, M4A</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                }}
                className="flex-1 py-3 border border-gray-300 rounded text-foreground"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="flex-1 py-3 bg-[#4291F2] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                업로드
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
