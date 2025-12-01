import Image from "next/image";

export default function Step1() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-linear-to-b from-[#F9F9F9] from-70% to-[#FFEFC3] to-100% max-w-md mx-auto">
      <Image
        src="/icons/landing/landing-logo.svg"
        alt="여느날 로고"
        width={200}
        height={200}
        className="object-contain"
      />
    </div>
  );
}
