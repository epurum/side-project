"use client";

import { Moon02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { SLEEP_TIMER_MINUTES } from "./use-sleep-timer";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

type Props = {
  minutes: number | null;
  remainingMs: number | null;
  onSelect: (minutes: number) => void;
  onCancel: () => void;
};

export function SleepTimer({ minutes, remainingMs, onSelect, onCancel }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <HugeiconsIcon icon={Moon02Icon} className="size-4 text-muted-foreground" aria-hidden />
      <span className="text-sm text-muted-foreground">취침 타이머</span>
      <ToggleGroup
        aria-label="취침 타이머"
        variant="outline"
        value={minutes === null ? [] : [String(minutes)]}
        onValueChange={(value) => {
          if (value.length === 0) onCancel();
          else onSelect(Number(value[0]));
        }}
      >
        {SLEEP_TIMER_MINUTES.map((option) => (
          <ToggleGroupItem key={option} value={String(option)}>
            {`${option}분`}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {remainingMs !== null && (
        <>
          <span className="text-sm tabular-nums">{`남은 시간 ${formatRemaining(remainingMs)}`}</span>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            타이머 끄기
          </Button>
        </>
      )}
    </div>
  );
}
