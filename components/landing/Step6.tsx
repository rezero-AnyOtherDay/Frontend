import Image from "next/image";

export default function Step6() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-8">
      <Image
        src="/icons/landing/landing-text17.svg"
        alt="업로드 완료"
        width={400}
        height={400}
        className="object-contain"
      />
    </div>
  );
}
