"use client";

import { ComputerIcon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Device = "desktop" | "mobile";

/**
 * 화면 맨 위 오른쪽 버튼으로 내용을 모바일폰 크기(390px)로 미리 보고 되돌린다.
 * 안의 내용은 다시 만들어지지 않아 입력과 재생 상태가 유지된다.
 * 내용의 반응형 배치는 창 너비가 아니라 이 틀의 너비(컨테이너 쿼리)를 따라야 모바일 레이아웃으로 바뀐다.
 */
export function DevicePreview({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<Device>("desktop");
  const isMobile = device === "mobile";
  const label = isMobile ? "데스크탑 화면으로 보기" : "모바일 화면으로 보기";

  return (
    <div className={cn("flex flex-1 flex-col transition-colors", isMobile && "bg-muted/50")}>
      <div className="flex justify-end px-4 pt-4 sm:px-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          title={label}
          onClick={() => setDevice(isMobile ? "desktop" : "mobile")}
        >
          <HugeiconsIcon icon={isMobile ? ComputerIcon : SmartPhone01Icon} />
        </Button>
      </div>

      <div
        role="group"
        aria-label="화면 미리보기"
        data-device={device}
        className={cn(
          "@container mx-auto flex w-full flex-1 flex-col pb-10 transition-[max-width]",
          isMobile
            ? "my-4 max-w-[390px] rounded-[2rem] border bg-background px-4 pt-8 shadow-lg"
            : "max-w-3xl px-4 pt-6 sm:px-6 sm:pb-16"
        )}
      >
        {children}
      </div>
    </div>
  );
}
