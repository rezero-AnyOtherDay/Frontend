import Image from "next/image";

export default function Step2() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-white max-w-md mx-auto">
      <Image
        src="/icons/landing/landing-text.svg"
        alt="여느날 소개"
        width={300}
        height={300}
        className="object-contain px-8"
      />
    </div>
  );
}
