"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    // 3초 후 레포트 페이지로 이동
    const timer = setTimeout(() => {
      router.push("/report");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">레포트 분석 중</h1>
          <p className="text-base text-muted-foreground">
            음성 파일을 분석하고 있어요
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>잠시만 기다려주세요...</p>
        </div>
      </div>
    </div>
  );
}
