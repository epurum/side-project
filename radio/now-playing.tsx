"use client";

import { AlertCircleIcon, StopIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import type { PlaybackTarget, PlayerState } from "./use-radio-player";

/** 방송국 이름이 채널 이름에 이미 들어 있으면(예: YTN 라디오) 채널 이름만 쓴다. */
export function displayName({ stationName, channel }: PlaybackTarget): string {
  return channel.name.toLowerCase().includes(stationName.toLowerCase())
    ? channel.name
    : `${stationName} ${channel.name}`;
}

type Props = {
  player: PlayerState;
  onStop: () => void;
  onRetry: () => void;
};

export function NowPlaying({ player, onStop, onRetry }: Props) {
  if (player.status === "idle") return null;

  const name = displayName(player.target);

  if (player.status === "error") {
    return (
      <Alert variant="destructive">
        <HugeiconsIcon icon={AlertCircleIcon} />
        <AlertTitle>{`${name} 재생에 실패했습니다`}</AlertTitle>
        <AlertDescription>
          <p>{player.message}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2 w-fit" onClick={onRetry}>
            다시 시도
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
      <p className="font-medium">
        {player.status === "connecting" ? `${name} 연결 중` : `${name} 재생 중`}
      </p>
      <Button type="button" variant="secondary" onClick={onStop}>
        <HugeiconsIcon icon={StopIcon} data-icon="inline-start" />
        정지
      </Button>
    </div>
  );
}
