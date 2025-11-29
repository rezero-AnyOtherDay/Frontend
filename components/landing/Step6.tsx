"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Step6Props {
  recordId?: number | null;
  onNext?: () => void;
  onPoll?: (recordId: number) => Promise<boolean>;
}

export default function Step6({ recordId, onNext, onPoll }: Step6Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 60;
  const POLL_INTERVAL = 2000;

  useEffect(() => {
    if (!recordId || !onPoll) {
      const timer = setTimeout(() => {
        if (onNext) {
          onNext();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    let pollTimer: NodeJS.Timeout;
    let mounted = true;

    const startPolling = async () => {
      for (let i = 0; i < MAX_POLLS && mounted; i++) {
        await new Promise((resolve) => {
          pollTimer = setTimeout(resolve, POLL_INTERVAL);
        });

        if (!mounted) break;

        setPollCount((prev) => prev + 1);

        const completed = await onPoll(recordId);

        if (completed && mounted) {
          setIsLoading(false);
          const finalTimer = setTimeout(() => {
            if (onNext && mounted) {
              onNext();
            }
          }, 2000);
          return () => clearTimeout(finalTimer);
        }
      }

      if (mounted) {
        setIsLoading(false);
        const timeoutTimer = setTimeout(() => {
          if (onNext && mounted) {
            onNext();
          }
        }, 2000);
        return () => clearTimeout(timeoutTimer);
      }
    };

    startPolling();

    return () => {
      mounted = false;
      clearTimeout(pollTimer);
    };
  }, [recordId, onNext, onPoll]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white px-4 max-w-md mx-auto">
      <Image
        src="/icons/landing/landing-text17.svg"
        alt="AI 분석 중"
        width={240}
        height={240}
        className="object-contain"
      />
      {isLoading && recordId && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <span className="inline-block w-8 h-8 border-4 border-[#D0DCFF] border-t-[#4F7DFF] rounded-full animate-spin" />
          <p className="text-sm text-[#9AA5BE]">AI가 분석 중입니다...</p>
        </div>
      )}
      {!isLoading && (
        <p className="mt-4 text-sm text-[#9AA5BE]">분석이 완료되었습니다</p>
      )}
    </div>
  );
}
