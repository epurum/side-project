"use client";

import { AlertCircleIcon, PlayIcon, StopIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { Cat } from "./cat";
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
  /** 정지된 채널을 다시 재생하거나, 실패한 채널을 다시 시도한다. */
  onPlay: () => void;
};

function statusLabel(player: PlayerState): string {
  switch (player.status) {
    case "connecting":
      return `${displayName(player.target)} 연결 중`;
    case "playing":
      return `${displayName(player.target)} 재생 중`;
    case "stopped":
      return `${displayName(player.target)} 정지됨`;
    default:
      return "재생 중인 채널이 없습니다";
  }
}

export function NowPlaying({ player, onStop, onPlay }: Props) {
  const isActive = player.status === "connecting" || player.status === "playing";

  return (
    <div className="flex flex-col gap-3">
      <div role="status" className="flex min-h-[5.125rem] flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border p-4">
        <p className="font-medium">{statusLabel(player)}</p>
        {/* 재생 중인 채널이 없을 때(처음, 재생 실패)는 아무 캐릭터도 보이지 않는다. */}
        {isActive && <Cat state="dancing" />}
        {player.status === "stopped" && <Cat state="resting" />}
        {isActive && (
          <Button type="button" variant="secondary" onClick={onStop}>
            <HugeiconsIcon icon={StopIcon} data-icon="inline-start" />
            정지
          </Button>
        )}
        {player.status === "stopped" && (
          <Button type="button" onClick={onPlay}>
            <HugeiconsIcon icon={PlayIcon} data-icon="inline-start" />
            재생
          </Button>
        )}
      </div>

      {player.status === "error" && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} />
          <AlertTitle>{`${displayName(player.target)} 재생에 실패했습니다`}</AlertTitle>
          <AlertDescription>
            <p>{player.message}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2 w-fit" onClick={onPlay}>
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
