import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/radio/stream/[source]/route";
import { isLookupChannel, lookupStreamUrl } from "@/radio/server";

const text = (body: string, status = 200) =>
  Promise.resolve(new Response(body, { status }));

afterEach(() => vi.unstubAllGlobals());

describe("MBC·EBS 스트림 주소 서버 조회", () => {
  it("MBC는 조회 응답 본문을 그대로 주소로 쓴다", async () => {
    const fetcher = vi.fn<(input: string) => Promise<Response>>(() => text("  https://minimw.imbc.test/mfm.stream/playlist.m3u8?_lsu_sa_=abc\n"));

    await expect(lookupStreamUrl("mbc", "mfm", fetcher)).resolves.toBe(
      "https://minimw.imbc.test/mfm.stream/playlist.m3u8?_lsu_sa_=abc"
    );
    expect(fetcher.mock.calls[0][0]).toContain("channel=mfm");
  });

  it("EBS는 온에어 페이지 HTML 안의 m3u8 주소를 꺼내고 &amp;를 풀어 준다", async () => {
    const html = `<script>var src = "https://liveotu.ebs.test/fm/fm.smil/playlist.m3u8?Policy=p&amp;Signature=s";</script>`;
    const fetcher = vi.fn(() => text(html));

    await expect(lookupStreamUrl("ebs", "radio", fetcher)).resolves.toBe(
      "https://liveotu.ebs.test/fm/fm.smil/playlist.m3u8?Policy=p&Signature=s"
    );
  });

  it("조회가 실패하거나 주소를 찾지 못하면 오류로 알린다", async () => {
    await expect(lookupStreamUrl("mbc", "sfm", () => text("", 500))).rejects.toThrow();
    await expect(lookupStreamUrl("ebs", "radio", () => text("<html></html>"))).rejects.toThrow();
  });

  it("카탈로그에 있는 채널만 조회할 수 있다", () => {
    expect(isLookupChannel("mbc", "sfm")).toBe(true);
    expect(isLookupChannel("ebs", "radio")).toBe(true);
    expect(isLookupChannel("mbc", "../etc")).toBe(false);
    expect(isLookupChannel("ebs", "iradio")).toBe(false);
  });
});

describe("GET /api/radio/stream/[source]", () => {
  const call = (source: string, channel: string | null) =>
    GET(
      new Request(
        `http://localhost/api/radio/stream/${source}${channel ? `?channel=${channel}` : ""}`
      ),
      { params: Promise.resolve({ source }) }
    );

  it("카탈로그의 채널이면 주소를 JSON으로 돌려준다", async () => {
    vi.stubGlobal("fetch", () => text("https://minisw.imbc.test/sfm.m3u8?_lsu_sa_=t"));

    const response = await call("mbc", "sfm");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://minisw.imbc.test/sfm.m3u8?_lsu_sa_=t" });
  });

  it("알 수 없는 방송국이나 채널은 400으로 거절한다", async () => {
    expect((await call("kbs", "21")).status).toBe(400);
    expect((await call("mbc", "nope")).status).toBe(400);
    expect((await call("mbc", null)).status).toBe(400);
  });

  it("방송사 조회가 실패하면 502로 알린다", async () => {
    vi.stubGlobal("fetch", () => text("", 500));

    expect((await call("mbc", "sfm")).status).toBe(502);
  });
});
