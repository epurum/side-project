import { isLookupChannel, lookupStreamUrl } from "@/radio/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params;
  const channel = new URL(request.url).searchParams.get("channel") ?? "";

  if ((source !== "mbc" && source !== "ebs") || !isLookupChannel(source, channel)) {
    return Response.json({ error: "알 수 없는 채널입니다" }, { status: 400 });
  }

  try {
    return Response.json({ url: await lookupStreamUrl(source, channel) });
  } catch {
    return Response.json({ error: "방송사에서 스트림 주소를 받지 못했습니다" }, { status: 502 });
  }
}
