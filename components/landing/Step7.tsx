import Image from "next/image";

export default function Step7() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-8">
      <Image
        src="/icons/landing/landing-text19.svg"
        alt="온보딩 완료"
        width={400}
        height={400}
        className="object-contain"
      />
    </div>
  );
}
