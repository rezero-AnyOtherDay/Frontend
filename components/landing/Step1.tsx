import Image from "next/image";

export default function Step1() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#FFEFC3] from-0% to-[#F9F9F9] to-94%">
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
