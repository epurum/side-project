/** 채널 재생 주소를 얻는 방법. 방송국마다 제공 방식이 달라 종류별로 나눈다. */
export type StreamSource =
  | { type: "hls"; url: string }
  | { type: "audio"; url: string }
  | { type: "sbs"; channelId: string }
  | { type: "kbs"; channelCode: string }
  | { type: "mbc"; channel: string }
  | { type: "ebs"; channel: string };

export type Channel = {
  id: string;
  name: string;
  source: StreamSource;
};

export type Station = {
  id: string;
  name: string;
  channels: Channel[];
};

const hls = (id: string, name: string, url: string): Channel => ({
  id,
  name,
  source: { type: "hls", url },
});

export const stations: Station[] = [
  {
    id: "sbs",
    name: "SBS",
    channels: [
      { id: "sbs-love", name: "러브FM", source: { type: "sbs", channelId: "S08" } },
      { id: "sbs-power", name: "파워FM", source: { type: "sbs", channelId: "S07" } },
    ],
  },
  {
    id: "kbs",
    name: "KBS",
    channels: [
      { id: "kbs-1radio", name: "1라디오", source: { type: "kbs", channelCode: "21" } },
      { id: "kbs-2radio", name: "2라디오", source: { type: "kbs", channelCode: "22" } },
      { id: "kbs-3radio", name: "3라디오", source: { type: "kbs", channelCode: "23" } },
      { id: "kbs-1fm", name: "1FM", source: { type: "kbs", channelCode: "24" } },
      { id: "kbs-2fm", name: "2FM", source: { type: "kbs", channelCode: "25" } },
      { id: "kbs-hanminjok", name: "한민족방송", source: { type: "kbs", channelCode: "26" } },
    ],
  },
  {
    id: "mbc",
    name: "MBC",
    channels: [
      { id: "mbc-sfm", name: "표준FM", source: { type: "mbc", channel: "sfm" } },
      { id: "mbc-fm4u", name: "FM4U", source: { type: "mbc", channel: "mfm" } },
      { id: "mbc-allthatmusic", name: "올댓뮤직", source: { type: "mbc", channel: "chm" } },
    ],
  },
  {
    id: "tbs",
    name: "TBS",
    channels: [
      hls("tbs-fm", "FM", "https://cdnfm.tbs.seoul.kr/tbs/_definst_/tbs_fm_web_360.smil/playlist.m3u8"),
      hls("tbs-efm", "eFM", "https://cdnefm.tbs.seoul.kr/tbs/_definst_/tbs_efm_web_360.smil/playlist.m3u8"),
    ],
  },
  {
    id: "ebs",
    name: "EBS",
    channels: [
      { id: "ebs-fm", name: "FM", source: { type: "ebs", channel: "radio" } },
      hls("ebs-foreign", "외국어 라디오", "https://ebsonair.ebs.co.kr/cloud1/iradio/playlist.m3u8"),
    ],
  },
  {
    id: "arirang",
    name: "아리랑라디오",
    channels: [
      hls(
        "arirang-radio",
        "아리랑라디오",
        "https://amdlive-ch03-ctnd-com.akamaized.net/arirang_3ch/smil:arirang_3ch.smil/playlist.m3u8"
      ),
    ],
  },
  {
    id: "ytn",
    name: "YTN",
    channels: [
      hls(
        "ytn-radio",
        "YTN 라디오",
        "https://radiolive.ytn.co.kr/radio/_definst_/20211118_fmlive/playlist.m3u8"
      ),
    ],
  },
  {
    id: "gugak",
    name: "국악방송",
    channels: [
      hls(
        "gugak-seoul",
        "서울·경기",
        "https://mgugaklive.nowcdn.co.kr/gugakradio/gugakradio.stream/playlist.m3u8"
      ),
      hls(
        "gugak-gwangju",
        "광주",
        "https://mgugaklive.nowcdn.co.kr/gugakgwangju/Glive.stream/playlist.m3u8"
      ),
      hls(
        "gugak-daejeon",
        "대전",
        "https://mgugaklive.nowcdn.co.kr/gugakdaejeon/Daejeonradio.stream/playlist.m3u8"
      ),
    ],
  },
  {
    id: "cbs",
    name: "CBS",
    channels: [
      hls(
        "cbs-standard",
        "표준FM",
        "https://m-aac.cbs.co.kr/mweb_cbs981/_definst_/cbs981.stream/playlist.m3u8"
      ),
      hls(
        "cbs-music",
        "음악FM",
        "https://m-aac.cbs.co.kr/mweb_cbs939/_definst_/cbs939.stream/playlist.m3u8"
      ),
      hls(
        "cbs-joy4u",
        "JOY4U",
        "https://m-aac.cbs.co.kr/mweb_cbscmc/_definst_/cbscmc.stream/playlist.m3u8"
      ),
    ],
  },
  {
    id: "febc",
    name: "극동방송",
    channels: [
      hls("febc-seoul", "서울", "https://mlive2.febc.net/live/seoulfm/playlist.m3u8"),
      hls("febc-daegu", "대구", "https://mlive3.febc.net/live5/daegulive/playlist.m3u8"),
    ],
  },
  {
    id: "bbs",
    name: "BBS",
    channels: [
      hls(
        "bbs-seoul",
        "서울불교방송",
        "https://bbslive.clouducs.com/bbsradio-mlive/radio.stream/playlist.m3u8"
      ),
    ],
  },
  {
    id: "wbs",
    name: "WBS",
    channels: [
      {
        id: "wbs-seoul",
        name: "서울원음방송",
        source: { type: "audio", url: "https://wbsradio.kr/wbs-seoul" },
      },
    ],
  },
  {
    id: "tbn",
    name: "TBN",
    channels: [
      hls("tbn-gyeongin", "경인교통방송", "https://www.tbn.it.kr/gyeongin/myStream/playlist.m3u8"),
      hls("tbn-busan", "부산교통방송", "https://www.tbn.it.kr/busan/myStream/playlist.m3u8"),
    ],
  },
  {
    id: "ifm",
    name: "iFM",
    channels: [hls("ifm-gyeongin", "경인방송", "https://stream.ifm.kr/live/aod1/playlist.m3u8")],
  },
  {
    id: "obs",
    name: "OBS",
    channels: [
      hls(
        "obs-radio",
        "OBS 라디오",
        "https://vod3.obs.co.kr:444/live/obsstream1/radio.stream/playlist.m3u8"
      ),
    ],
  },
  {
    id: "kookbang",
    name: "국방FM",
    channels: [
      hls(
        "kookbang-fm",
        "국방FM",
        "https://mediaworks.dema.mil.kr/live_edge/audio.sdp/playlist.m3u8"
      ),
    ],
  },
  {
    id: "befm",
    name: "BeFM",
    channels: [
      hls(
        "befm-busan",
        "부산영어방송",
        "https://live.cdn.smilecdn.com/befm905_live/live/playlist.m3u8"
      ),
    ],
  },
  {
    id: "afn",
    name: "AFN Korea",
    channels: [
      {
        id: "afn-humphreys",
        name: "Humphreys",
        source: {
          type: "audio",
          url: "https://playerservices.streamtheworld.com/api/livestream-redirect/AFNP_OSNAAC.aac",
        },
      },
      {
        id: "afn-daegu",
        name: "Daegu",
        source: {
          type: "audio",
          url: "https://playerservices.streamtheworld.com/api/livestream-redirect/AFNP_DGUAAC.aac",
        },
      },
      {
        id: "afn-kunsan",
        name: "Kunsan",
        source: {
          type: "audio",
          url: "https://playerservices.streamtheworld.com/api/livestream-redirect/AFNP_KSNAAC.aac",
        },
      },
    ],
  },
];

/** 방송국 이름 또는 그 방송국 채널 이름에 검색어가 들어 있으면(대소문자 무시) 찾는다. */
export function searchStations(query: string): Station[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return stations;

  return stations.filter(
    (station) =>
      station.name.toLowerCase().includes(needle) ||
      station.channels.some((channel) => channel.name.toLowerCase().includes(needle))
  );
}
