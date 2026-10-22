"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";

import { createAudioEngine, type AudioEngine } from "./audio-engine";
import { searchStations, type StreamSource } from "./catalog";
import { ChannelList } from "./channel-list";
import { NowPlaying } from "./now-playing";
import { resolveStream, type ResolvedStream } from "./stream";
import { SleepTimer } from "./sleep-timer";
import { useRadioPlayer } from "./use-radio-player";
import { useSleepTimer } from "./use-sleep-timer";

type Props = {
  /** 테스트에서 브라우저 오디오와 방송사 조회를 대신할 때만 넘긴다. */
  engine?: AudioEngine;
  resolve?: (source: StreamSource) => Promise<ResolvedStream>;
};

export function RadioApp({ engine, resolve = resolveStream }: Props) {
  const [audioEngine] = useState(() => engine ?? createAudioEngine());
  const { state: player, play, stop } = useRadioPlayer(audioEngine, resolve);
  const timer = useSleepTimer({
    sessionActive: player.status === "connecting" || player.status === "playing",
    onExpire: stop,
  });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = searchStations(query);
  const selected = results.find((station) => station.id === selectedId) ?? null;

  const toggleChannel = (channelId: string) => {
    if (!selected) return;
    const channel = selected.channels.find((item) => item.id === channelId);
    if (!channel) return;

    const isLive = player.target?.channel.id === channelId && (player.status === "connecting" || player.status === "playing");
    if (isLive) stop();
    else void play({ stationName: selected.name, channel });
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">라디오 라이브</h1>
        <p className="text-muted-foreground">방송국을 고르고 채널을 누르면 바로 들을 수 있습니다.</p>
      </header>

      <NowPlaying
        player={player}
        onStop={stop}
        onRetry={() => player.target && void play(player.target)}
      />

      {timer.expired && (
        <Alert role="status">
          <AlertTitle>취침 타이머로 종료되었습니다</AlertTitle>
        </Alert>
      )}

      {player.status === "playing" && (
        <SleepTimer
          minutes={timer.minutes}
          remainingMs={timer.remainingMs}
          onSelect={timer.start}
          onCancel={timer.cancel}
        />
      )}

      <section className="flex flex-col gap-4">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="방송국 또는 채널 검색"
            placeholder="방송국 또는 채널 이름 검색"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {results.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>일치하는 방송국이 없습니다</EmptyTitle>
              <EmptyDescription>방송국이나 채널 이름을 다시 입력해 보세요.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div role="group" aria-label="방송국" className="flex flex-wrap gap-2">
            {results.map((station) => (
              <Button
                key={station.id}
                type="button"
                variant={station.id === selected?.id ? "default" : "outline"}
                aria-pressed={station.id === selected?.id}
                onClick={() => setSelectedId(station.id)}
              >
                {station.name}
              </Button>
            ))}
          </div>
        )}
      </section>

      {selected && <ChannelList station={selected} player={player} onToggle={toggleChannel} />}
    </div>
  );
}
