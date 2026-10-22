"use client";

import { Radio01Icon, StopIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import type { Station } from "./catalog";
import type { PlayerState } from "./use-radio-player";

type Props = {
  station: Station;
  player: PlayerState;
  onToggle: (channelId: string) => void;
};

export function ChannelList({ station, player, onToggle }: Props) {
  return (
    <div
      role="group"
      aria-label={`${station.name} 채널`}
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
    >
      {station.channels.map((channel) => {
        const isTarget = player.target?.channel.id === channel.id;
        const isActive = isTarget && (player.status === "connecting" || player.status === "playing");
        const hasError = isTarget && player.status === "error";

        return (
          <Button
            key={channel.id}
            type="button"
            size="lg"
            variant={isActive ? "default" : hasError ? "destructive" : "outline"}
            aria-pressed={isActive}
            className="h-auto justify-start gap-3 py-3"
            onClick={() => onToggle(channel.id)}
          >
            <HugeiconsIcon icon={Radio01Icon} data-icon="inline-start" />
            <span className="flex-1 text-left">{channel.name}</span>
            {isTarget && player.status === "connecting" ? (
              <Spinner data-icon="inline-end" />
            ) : isActive ? (
              <HugeiconsIcon icon={StopIcon} data-icon="inline-end" />
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}
