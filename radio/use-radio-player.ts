"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AudioEngine } from "./audio-engine";
import type { Channel } from "./catalog";
import type { ResolvedStream } from "./stream";
import type { StreamSource } from "./catalog";

export type PlaybackTarget = { stationName: string; channel: Channel };

export type PlayerState =
  | { status: "idle"; target: null; message?: undefined }
  | { status: "connecting" | "playing" | "stopped"; target: PlaybackTarget; message?: undefined }
  | { status: "error"; target: PlaybackTarget; message: string };

const IDLE: PlayerState = { status: "idle", target: null };

/**
 * 한 번에 하나의 채널만 재생한다. 새 요청이 들어오면 앞선 요청의 결과는 버린다.
 * 정지해도 마지막 채널(target)은 남겨, 같은 채널을 바로 다시 재생할 수 있게 한다.
 */
export function useRadioPlayer(
  engine: AudioEngine,
  resolve: (source: StreamSource) => Promise<ResolvedStream>
) {
  const [state, setState] = useState<PlayerState>(IDLE);
  const requestId = useRef(0);
  const engineActive = useRef(false);

  const stop = useCallback(() => {
    requestId.current++;
    if (engineActive.current) engine.stop();
    engineActive.current = false;
    setState((previous) =>
      previous.target ? { status: "stopped", target: previous.target } : IDLE
    );
  }, [engine]);

  const play = useCallback(
    async (target: PlaybackTarget) => {
      const id = ++requestId.current;
      const isCurrent = () => id === requestId.current;
      if (engineActive.current) engine.stop();
      engineActive.current = true;
      setState({ status: "connecting", target });

      const fail = (message: string) => {
        if (!isCurrent()) return;
        engine.stop();
        engineActive.current = false;
        setState({ status: "error", target, message });
      };

      try {
        const stream = await resolve(target.channel.source);
        if (!isCurrent()) return;
        await engine.play(stream, fail);
        if (!isCurrent()) return;
        setState({ status: "playing", target });
      } catch (error) {
        fail(error instanceof Error ? error.message : "재생을 시작하지 못했습니다.");
      }
    },
    [engine, resolve]
  );

  useEffect(() => () => engine.stop(), [engine]);

  return { state, play, stop };
}
