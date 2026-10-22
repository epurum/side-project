import type Hls from "hls.js";

import type { ResolvedStream } from "./stream";

/** 브라우저에서 라이브 스트림을 실제로 재생하고 멈추는 경계. */
export type AudioEngine = {
  /** 재생이 시작되면 끝난다. 시작하지 못하면 거절한다. 시작 뒤의 치명적 오류는 onFailure로 알린다. */
  play(stream: ResolvedStream, onFailure: (message: string) => void): Promise<void>;
  stop(): void;
};

export function createAudioEngine(): AudioEngine {
  let audio: HTMLAudioElement | null = null;
  let hls: Hls | null = null;

  const teardown = () => {
    hls?.destroy();
    hls = null;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio = null;
    }
  };

  return {
    async play(stream, onFailure) {
      teardown();
      const element = new Audio();
      audio = element;
      element.addEventListener("error", () => {
        if (audio === element) onFailure("스트림을 재생하는 중 오류가 발생했습니다.");
      });

      if (stream.protocol === "hls") {
        const { default: HlsLib } = await import("hls.js");
        // 주소를 기다리는 사이 다른 채널을 눌렀거나 정지했다면 여기서 끝낸다.
        if (audio !== element) return;
        if (HlsLib.isSupported()) {
          const instance = new HlsLib();
          hls = instance;
          instance.on(HlsLib.Events.ERROR, (_event, data) => {
            if (data.fatal && audio === element) onFailure("방송 연결이 끊어졌습니다.");
          });
          instance.loadSource(stream.url);
          instance.attachMedia(element);
        } else if (element.canPlayType("application/vnd.apple.mpegurl")) {
          element.src = stream.url;
        } else {
          throw new Error("이 브라우저는 HLS 스트림을 재생할 수 없습니다.");
        }
      } else {
        element.src = stream.url;
      }

      await element.play();
    },
    stop: teardown,
  };
}
