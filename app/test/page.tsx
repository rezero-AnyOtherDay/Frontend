'use client'

import { Construction } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'

export default function TestPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center px-4 py-60">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-8">
              <Construction className="h-20 w-20 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              준비중입니다
            </h2>
            <p className="text-base text-muted-foreground">
              더 나은 서비스로 찾아뵙겠습니다
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
