"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AppLayout from "@/components/layout/AppLayout";

export default function ConsultationPage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      if (storedUserName) {
        setUserName(storedUserName);
      }
    }
  }, []);

  const hospitals = [
    {
      id: 1,
      name: "서울대학교병원",
      department: "신경과",
      distance: "1.2km",
      phone: "02-2072-2114",
      hours: "평일 09:00 - 18:00",
    },
    {
      id: 2,
      name: "삼성서울병원",
      department: "신경과",
      distance: "2.5km",
      phone: "02-3410-2114",
      hours: "평일 08:30 - 17:30",
    },
    {
      id: 3,
      name: "세브란스병원",
      department: "신경과",
      distance: "3.1km",
      phone: "02-2228-5800",
      hours: "평일 09:00 - 18:00",
    },
  ];

  const headerContent = (
    <div className="px-4 py-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-foreground">
        {userName
          ? `${userName} 님에게 도움이 필요한가요?`
          : "도움이 필요한가요?"}
      </h1>
    </div>
  );

  return (
    <AppLayout hasHeader={true} headerContent={headerContent}>
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto w-full">
        {/* 지도 영역 (임시) */}
        <Card className="bg-card border-0 rounded-md shadow-none overflow-hidden h-48">
          <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">지도 표시 영역</p>
            </div>
          </div>
        </Card>

        {/* 우리동네 맞춤 병원 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">
            우리 동네 맞춤 병원
          </h2>

          <div className="space-y-3">
            {hospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className="bg-card border-0 p-4 rounded-md shadow-none"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-foreground mb-1">
                        {hospital.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {hospital.department}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {hospital.distance}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {hospital.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {hospital.hours}
                      </span>
                    </div>
                  </div>

                  <div className="px-2">
                    <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-full shadow-none text-base">
                      전화 연결
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
