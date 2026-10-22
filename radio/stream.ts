import type { StreamSource } from "./catalog";

export type ResolvedStream = {
  url: string;
  /** hls는 hls.js 또는 네이티브 HLS로, audio는 audio 요소가 직접 재생한다. */
  protocol: "hls" | "audio";
};

type Fetcher = (input: string) => Promise<Response>;

async function readJson(fetcher: Fetcher, url: string): Promise<unknown> {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`스트림 주소 조회 실패 (${response.status})`);
  return response.json();
}

function requireUrl(value: unknown): string {
  if (typeof value !== "string" || !value) throw new Error("스트림 주소가 응답에 없습니다");
  return value;
}

/**
 * 재생 직전에 채널의 현재 스트림 주소를 얻는다.
 * 주소에 서명이나 토큰이 붙어 만료되는 방송국이 있어, 재생 때마다 새로 받는다.
 */
export async function resolveStream(
  source: StreamSource,
  fetcher: Fetcher = (input) => fetch(input)
): Promise<ResolvedStream> {
  switch (source.type) {
    case "hls":
      return { url: source.url, protocol: "hls" };
    case "audio":
      return { url: source.url, protocol: "audio" };
    case "sbs": {
      const data = (await readJson(
        fetcher,
        `https://apis.sbs.co.kr/play-api/1.0/onair/channel/${source.channelId}?v_type=2&platform=pcweb&protocol=hls&ssl=Y&rnd=${Date.now()}`
      )) as { onair?: { source?: { mediasource?: { mediaurl?: string } } } };
      return { url: requireUrl(data.onair?.source?.mediasource?.mediaurl), protocol: "hls" };
    }
    case "kbs": {
      const data = (await readJson(
        fetcher,
        `https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${source.channelCode}`
      )) as { channel_item?: { service_url?: string }[] };
      return { url: requireUrl(data.channel_item?.[0]?.service_url), protocol: "hls" };
    }
    // MBC 조회 API는 CORS 헤더가 없고 EBS는 페이지 HTML을 읽어야 해서, 앱 서버 경로를 거친다.
    case "mbc":
    case "ebs": {
      const data = (await readJson(
        fetcher,
        `/api/radio/stream/${source.type}?channel=${encodeURIComponent(source.channel)}`
      )) as { url?: string };
      return { url: requireUrl(data.url), protocol: "hls" };
    }
  }
}
