import { stations } from "./catalog";

type LookupSource = "mbc" | "ebs";
type Fetcher = (input: string) => Promise<Response>;

const BROWSER_HEADERS = { "user-agent": "Mozilla/5.0" };

/** 카탈로그에 등록된 채널만 방송사 조회 대상이 된다. 임의의 값이 방송사 요청에 섞이지 않게 한다. */
export function isLookupChannel(source: string, channel: string): boolean {
  return stations.some((station) =>
    station.channels.some(
      (item) =>
        (item.source.type === "mbc" || item.source.type === "ebs") &&
        item.source.type === source &&
        item.source.channel === channel
    )
  );
}

const defaultFetcher: Fetcher = (input) =>
  fetch(input, { headers: BROWSER_HEADERS, cache: "no-store" });

/** MBC는 조회 응답 본문이 주소이고, EBS는 온에어 페이지 HTML에 주소가 들어 있다. */
export async function lookupStreamUrl(
  source: LookupSource,
  channel: string,
  fetcher: Fetcher = defaultFetcher
): Promise<string> {
  const upstream =
    source === "mbc"
      ? `https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=${encodeURIComponent(channel)}`
      : `https://www.ebs.co.kr/onair?channelCodeString=${encodeURIComponent(channel)}`;

  const response = await fetcher(upstream);
  if (!response.ok) throw new Error(`방송사 조회 실패 (${response.status})`);
  const body = await response.text();

  const url =
    source === "mbc"
      ? body.trim()
      : body.match(/https:\/\/[^"'\s]*?\.m3u8[^"'\s]*/)?.[0].replace(/&amp;/g, "&");
  if (!url) throw new Error("방송사 응답에서 스트림 주소를 찾지 못했습니다");
  return url;
}
