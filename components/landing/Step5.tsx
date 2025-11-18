import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Step5Props {
  onUpload: () => void;
  onSkip: () => void;
}

export default function Step5({ onUpload, onSkip }: Step5Props) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-between bg-white px-8 py-12">
      <div className="flex flex-1 items-center justify-center">
        <Image
          src="/icons/landing/landing-text15.svg"
          alt="음성 업로드 안내"
          width={400}
          height={400}
          className="object-contain"
        />
      </div>

      <div className="w-full max-w-md space-y-4 pb-8">
        <Button
          onClick={onUpload}
          className="w-full bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          업로드하기
        </Button>
        <Button
          onClick={onSkip}
          variant="secondary"
          className="w-full bg-[#E0E0E0] py-6 text-base font-medium text-foreground hover:bg-[#D0D0D0]"
        >
          나중에할래요
        </Button>
      </div>
    </div>
  );
}
