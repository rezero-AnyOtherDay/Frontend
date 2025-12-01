"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Ward {
  wardId: number;
  name: string;
  gender: "male" | "female";
  relationship: string;
  birthDate?: string;
  age?: number;
}

export default function MyPage() {
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardianName, setGuardianName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        console.log("=== 마이페이지 로드 ===");

        // localStorage에서 wardId와 userName 확인
        const storedWardId = localStorage.getItem("wardId");
        const storedUserName = localStorage.getItem("userName");

        if (storedUserName) {
          setGuardianName(storedUserName);
        }

        // 더미 보호자 ID (실제로는 인증 시스템에서 가져와야 함)
        const guardianId = 1;

        // 보호자의 피보호자 목록 조회
        const wardsUrl = `${process.env.NEXT_PUBLIC_API_URL}/wards?guardianId=${guardianId}`;
        console.log("피보호자 목록 조회 URL:", wardsUrl);

        const response = await fetch(wardsUrl);
        console.log("응답 상태:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("응답 본문 (원본):", result);

          const wardsList = result.data || result;
          console.log("파싱된 피보호자 목록:", wardsList);

          if (Array.isArray(wardsList)) {
            setWards(wardsList);
            console.log("피보호자 목록 설정됨:", wardsList.length, "명");
          } else {
            console.warn("wardsList가 배열이 아님:", wardsList);
            setWards([]);
          }
        } else {
          const errorText = await response.text();
          console.error("피보호자 목록 조회 실패:");
          console.error("- 상태 코드:", response.status);
          console.error("- 상태 텍스트:", response.statusText);
          console.error("- 응답 본문:", errorText);
          setError(`피보호자 목록을 불러올 수 없습니다. (${response.status} ${response.statusText})`);
          setWards([]);
        }
      } catch (error) {
        console.error("마이페이지 로드 중 오류:", error);
        setError("오류가 발생했습니다.");
        setWards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWards();
  }, []);

  const handleWardSelect = (wardId: number, wardName: string) => {
    console.log("피보호자 선택:", wardId, wardName);
    // 선택한 피보호자 정보를 localStorage에 저장
    localStorage.setItem("wardId", String(wardId));
    localStorage.setItem("userName", wardName);

    // 홈으로 이동
    router.push("/");
  };

  const headerContent = (
    <div className="px-6 py-4 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-foreground"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">마이페이지</h1>
      </div>
    </div>
  );

  return (
    <AppLayout hasHeader={true} headerContent={headerContent} showNavigation={false}>
      <div className="px-6 py-4 space-y-4 max-w-md mx-auto w-full">
        {/* 보호자 정보 */}
        <Card className="bg-white p-5 rounded-md shadow-none border-0">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">현재 피보호자</p>
            <h2 className="text-xl font-bold text-foreground">
              {guardianName || "피보호자"}
            </h2>
          </div>
        </Card>

        {/* 피보호자 목록 섹션 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">피보호자 목록</h3>

          {loading ? (
            <Card className="bg-white p-5 rounded-md shadow-none border-0 text-center">
              <p className="text-sm text-muted-foreground">로드 중...</p>
            </Card>
          ) : error ? (
            <Card className="bg-white p-5 rounded-md shadow-none border-0 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </Card>
          ) : wards.length > 0 ? (
            <div className="space-y-2">
              {wards.map((ward) => (
                <Card
                  key={ward.wardId}
                  className="bg-white p-4 rounded-md shadow-none border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleWardSelect(ward.wardId, ward.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-foreground">
                        {ward.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {ward.gender === "male" ? "남자" : "여자"}
                        </span>
                        {ward.age !== undefined && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {ward.age}세
                            </span>
                          </>
                        )}
                        {ward.relationship && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {ward.relationship}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white p-5 rounded-md shadow-none border-0 text-center">
              <p className="text-sm text-muted-foreground">
                등록된 피보호자가 없습니다.
              </p>
            </Card>
          )}
        </div>

        {/* 새 피보호자 등록 버튼 */}
        {wards.length > 0 && (
          <Button
            onClick={() => router.push("/landing")}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-none text-base mt-6"
          >
            새 피보호자 등록
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
