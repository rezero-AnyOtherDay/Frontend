"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step3Props {
  formData: {
    name: string;
    gender: string;
    birthDate: string;
    relationship: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export default function Step3({ formData, onFormChange }: Step3Props) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white px-8">
      <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
        여느날을 함께할 사람을 알려주세요
      </h1>

      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChange={(e) => onFormChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">성별</Label>
          <Select value={formData.gender} onValueChange={(value) => onFormChange("gender", value)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="성별을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">남성</SelectItem>
              <SelectItem value="female">여성</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">생년월일</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => onFormChange("birthDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">관계</Label>
          <Select value={formData.relationship} onValueChange={(value) => onFormChange("relationship", value)}>
            <SelectTrigger id="relationship">
              <SelectValue placeholder="관계를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parent">부모님</SelectItem>
              <SelectItem value="grandparent">조부모님</SelectItem>
              <SelectItem value="spouse">배우자</SelectItem>
              <SelectItem value="relative">친척</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
