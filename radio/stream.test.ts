import { describe, expect, it, vi } from "vitest";

import { resolveStream } from "@/radio";

const json = (body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

describe("채널 스트림 주소 조회", () => {
  it("고정 주소 채널은 조회 없이 그 주소를 쓴다", async () => {
    const fetcher = vi.fn();

    await expect(
      resolveStream({ type: "hls", url: "https://example.test/a.m3u8" }, fetcher)
    ).resolves.toEqual({ url: "https://example.test/a.m3u8", protocol: "hls" });
    await expect(
      resolveStream({ type: "audio", url: "https://example.test/live" }, fetcher)
    ).resolves.toEqual({ url: "https://example.test/live", protocol: "audio" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("SBS는 재생 API 응답에서 HLS 주소를 꺼낸다", async () => {
    const fetcher = vi.fn<(input: string) => Promise<Response>>(() =>
      json({ onair: { source: { mediasource: { mediaurl: "https://radiolive.sbs.test/love.m3u8?token=t" } } } })
    );

    await expect(resolveStream({ type: "sbs", channelId: "S08" }, fetcher)).resolves.toEqual({
      url: "https://radiolive.sbs.test/love.m3u8?token=t",
      protocol: "hls",
    });
    expect(fetcher.mock.calls[0][0]).toContain("/onair/channel/S08?");
  });

  it("KBS는 채널 코드로 조회한 첫 번째 항목의 서비스 주소를 쓴다", async () => {
    const fetcher = vi.fn<(input: string) => Promise<Response>>(() =>
      json({ channel_item: [{ service_url: "https://kbs.test/1fm.m3u8?Policy=p" }, { service_url: "https://kbs.test/bora.m3u8" }] })
    );

    await expect(resolveStream({ type: "kbs", channelCode: "24" }, fetcher)).resolves.toEqual({
      url: "https://kbs.test/1fm.m3u8?Policy=p",
      protocol: "hls",
    });
    expect(fetcher.mock.calls[0][0]).toContain("/channel_code/24");
  });

  it("MBC와 EBS는 브라우저가 직접 조회할 수 없어 앱의 조회 경로를 거친다", async () => {
    const fetcher = vi.fn((input: string) =>
      json({ url: `https://upstream.test/${input.includes("mbc") ? "mbc" : "ebs"}.m3u8` })
    );

    await expect(resolveStream({ type: "mbc", channel: "mfm" }, fetcher)).resolves.toEqual({
      url: "https://upstream.test/mbc.m3u8",
      protocol: "hls",
    });
    await expect(resolveStream({ type: "ebs", channel: "radio" }, fetcher)).resolves.toEqual({
      url: "https://upstream.test/ebs.m3u8",
      protocol: "hls",
    });
    expect(fetcher.mock.calls[0][0]).toBe("/api/radio/stream/mbc?channel=mfm");
    expect(fetcher.mock.calls[1][0]).toBe("/api/radio/stream/ebs?channel=radio");
  });

  it("응답이 실패하거나 주소가 없으면 오류로 알린다", async () => {
    const failed = vi.fn(() => Promise.resolve(new Response("", { status: 500 })));
    const empty = vi.fn(() => json({ onair: { info: { onair_yn: "N" } } }));

    await expect(resolveStream({ type: "sbs", channelId: "S08" }, failed)).rejects.toThrow();
    await expect(resolveStream({ type: "sbs", channelId: "S08" }, empty)).rejects.toThrow();
  });
});
