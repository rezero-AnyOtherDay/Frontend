"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Step3Props {
  formData: {
    name: string;
    gender: "male" | "female" | "";
    birthDate: string;
    relationship: string;
  };
  onFormChange: (field: string, value: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export default function Step3({
  formData,
  onFormChange,
  isSubmitting = false,
  errorMessage,
}: Step3Props) {
  const genderOptions = [
    { value: "male", label: "남자" },
    { value: "female", label: "여자" },
  ];

  const relationshipOptions = useMemo(
    () => [
      { value: "mother", label: "엄마" },
      { value: "father", label: "아빠" },
      { value: "spouse", label: "배우자" },
      { value: "son", label: "아들" },
      { value: "daughter", label: "딸" },
      { value: "custom", label: "직접 입력" },
    ],
    [],
  );

  const deriveSelection = () => {
    const matched = relationshipOptions.find(
      (option) => option.label === formData.relationship,
    );
    return matched ? matched.value : "custom";
  };

  const [relationshipSelection, setRelationshipSelection] =
    useState(deriveSelection);
  const [relationshipCustom, setRelationshipCustom] = useState(
    deriveSelection() === "custom" ? formData.relationship : "",
  );

  useEffect(() => {
    const currentSelection = deriveSelection();
    setRelationshipSelection(currentSelection);
    if (currentSelection === "custom") {
      setRelationshipCustom(formData.relationship ?? "");
    }
  }, [formData.relationship]);

  const handleRelationshipChange = (value: string) => {
    setRelationshipSelection(value);
    if (value === "custom") {
      setRelationshipCustom(formData.relationship ?? "");
      if (formData.relationship === undefined) {
        onFormChange("relationship", "");
      }
      return;
    }
    const option = relationshipOptions.find(
      (relationship) => relationship.value === value,
    );
    if (option) {
      onFormChange("relationship", option.label);
    }
  };

  const handleRelationshipCustomChange = (value: string) => {
    setRelationshipCustom(value);
    onFormChange("relationship", value);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center bg-linear-to-b from-[#F7FAFF] to-white px-5 py-12 max-w-md mx-auto">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xl font-semibold text-[#9AA5BE]">
            여느날을 함께할 사람을 알려주세요
          </p>
          <p className="text-sm text-[#9AA5BE]">
            소중한 분의 정보를 입력해주세요.
          </p>
        </div>

        <div className="space-y-7">
          <div className="space-y-3">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-[#1B2A49]"
            >
              이름
            </Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              className="rounded-none border-0 border-b border-[#C8D5F5] bg-transparent px-0 pb-2 text-lg font-semibold text-[#1B2A49] placeholder:text-[#B0BACF] focus-visible:border-[#5A8CFB] focus-visible:ring-0"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-[#1B2A49]">성별</Label>
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((option) => {
                const isActive = formData.gender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onFormChange("gender", option.value)}
                    className={cn(
                      "rounded-full py-3 text-base font-semibold transition-colors",
                      isActive
                        ? "bg-[#4291F2] text-white"
                        : "bg-[#E7F0FF] text-[#4291F2]",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="birthDate"
              className="text-sm font-semibold text-[#1B2A49]"
            >
              생년월일
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => onFormChange("birthDate", e.target.value)}
              className="rounded-none border-0 border-b border-[#C8D5F5] bg-transparent px-0 pb-2 text-lg font-semibold text-[#1B2A49] placeholder:text-[#B0BACF] focus-visible:border-[#5A8CFB] focus-visible:ring-0"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="relationship"
              className="text-sm font-semibold text-[#1B2A49]"
            >
              관계
            </Label>
            <div className="space-y-3">
              <Select
                value={relationshipSelection}
                onValueChange={handleRelationshipChange}
              >
                <SelectTrigger className="h-12 w-full rounded-full border-none bg-[#E7F0FF] px-5 text-base font-semibold text-[#4291F2] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="관계를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  {relationshipOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {relationshipSelection === "custom" && (
                <div>
                  <Input
                    id="relationship"
                    placeholder="예: 딸, 사위 등"
                    value={relationshipCustom}
                    onChange={(e) =>
                      handleRelationshipCustomChange(e.target.value)
                    }
                    className="rounded-none border-0 border-b border-[#C8D5F5] bg-transparent px-0 pb-2 text-lg font-semibold text-[#1B2A49] placeholder:text-[#B0BACF] focus-visible:border-[#5A8CFB] focus-visible:ring-0"
                  />
                  <p className="mt-1 text-xs text-[#9AA5BE]">
                    직접 입력 후 다음 단계를 진행해주세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {errorMessage && (
          <p className="text-center text-sm text-red-500">{errorMessage}</p>
        )}
        {isSubmitting && (
          <p className="text-center text-sm text-[#9AA5BE]">
            피보호자 정보를 저장하는 중...
          </p>
        )}
      </div>
    </div>
  );
}
