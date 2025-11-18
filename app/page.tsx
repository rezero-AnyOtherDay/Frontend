'use client'

import { useState } from 'react'
import { ChevronRight, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Image from 'next/image'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home')
  const [showAlert, setShowAlert] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  // 예시 데이터
  const userName = '육순'
  const daysWithoutCall = 10
  const recentStatus = '뇌졸중'
  const alertCount = 3

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      setShowUploadModal(false)
      setShowConfirmModal(true)
    }
  }

  const headerContent = (
    <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2">
        <Image src="/icons/home/home-logo.svg" alt="어느날 로고" width={71} height={35} />
        <div className="w-3 h-3 rounded-full bg-accent"></div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="p-0">
          <Image src="/icons/home/home-mypage.svg" alt="마이페이지" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon" className="p-0 relative">
          <Image src="/icons/home/home-alarm.svg" alt="알림" width={20} height={22} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive-foreground rounded-full"></span>
        </Button>
      </div>
    </div>
  )

  return (
    <AppLayout hasHeader={true} headerContent={headerContent}>
      <div className="px-4 py-4 space-y-4 max-w-md mx-auto w-full">
        {showAlert && (
          <Card className="bg-card border-0 p-4 rounded relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground h-6 w-6"
              onClick={() => setShowAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Image src="/icons/home/home-call.svg" alt="통화" width={24} height={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-foreground mb-1">
                  오늘 {userName}님과 통화 어떠세요?
                </h3>
                <p className="text-sm text-muted-foreground">
                  {daysWithoutCall}일간 통화하지 않았어요
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-card border-0 p-5 rounded">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">최근 결과</p>
            <div className="space-y-2">
              <h2 className="text-base leading-relaxed">
                최근 <span className="font-bold text-primary">{userName}</span>님의 상태는
              </h2>
              <h2 className="text-xl font-bold text-primary leading-relaxed">
                {recentStatus}이 의심돼요
              </h2>
            </div>

            <div className="flex justify-center py-4">
              <Image src="/icons/home/home-warning.svg" alt="경고" width={162} height={126} />
            </div>

            <Link href="/report">
              <Card className="bg-destructive border-0 p-3.5 rounded cursor-pointer hover:opacity-90 transition-opacity">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-destructive-foreground">
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

        <Card className="bg-card border-0 p-5 rounded">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">녹음된 확인</p>
            <div className="space-y-1">
              <p className="text-base leading-relaxed">
                <span className="font-bold text-foreground">{userName}</span>님과의 통화로
              </p>
              <p className="text-base font-bold text-primary leading-relaxed">
                위험도를 알아봐요
              </p>
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded text-base"
            >
              업로드하기
            </Button>
          </div>
        </Card>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-sm p-6 rounded">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  음성 녹음 파일 업로드
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded p-8 text-center">
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
                  <div className="bg-muted p-3 rounded">
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
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded disabled:opacity-50"
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
          <Card className="bg-white w-full max-w-sm p-6 rounded">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground text-center">
                자가진단표를 수정할까요?
              </h2>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded"
                  onClick={() => {
                    setShowConfirmModal(false)
                    router.push('/self-diagnosis')
                  }}
                >
                  수정할래요
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-foreground font-medium py-3 rounded"
                  onClick={() => {
                    setShowConfirmModal(false)
                    router.push('/loading')
                  }}
                >
                  결과 확인
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
