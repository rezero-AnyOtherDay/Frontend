import { Button } from "@/components/ui/button";

interface Step5Props {
  onUpload: () => void;
  onSkip: () => void;
  userName?: string;
}

export default function Step5({ onUpload, onSkip, userName }: Step5Props) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-between bg-white px-6 py-12 max-w-md mx-auto">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-[22px] leading-snug font-extrabold text-[#979EA1]">
            {userName
              ? `${userName}님과의 통화를 지금 업로드 하면`
              : "피보호자님과의 통화를 지금 업로드 하면"}
          </p>
          <p className="mt-2 text-[22px] leading-snug font-extrabold text-[#979EA1]">
            바로 분석할 수 있어요!
          </p>
        </div>
      </div>

      <div className="w-full space-y-2 pb-8">
        <Button
          onClick={onUpload}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-none text-base"
        >
          업로드하기
        </Button>
        <Button
          onClick={onSkip}
          className="w-full h-12 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-foreground font-medium rounded-full shadow-none text-base"
        >
          나중에 할래요
        </Button>
      </div>
    </div>
  );
}
