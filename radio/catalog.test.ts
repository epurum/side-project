import { describe, expect, it } from "vitest";

import { searchStations, stations } from "@/radio";

const names = (list: { name: string }[]) => list.map((item) => item.name);

describe("방송국 검색", () => {
  it("검색어가 비어 있으면 18개 방송국을 모두 보여준다", () => {
    expect(searchStations("")).toHaveLength(18);
    expect(searchStations("   ")).toHaveLength(18);
  });

  it("방송국 이름으로 대소문자 구분 없이 찾는다", () => {
    expect(names(searchStations("sbs"))).toEqual(["SBS"]);
    expect(names(searchStations("SbS"))).toEqual(["SBS"]);
  });

  it("채널 이름의 일부만 입력해도 그 채널이 속한 방송국을 찾는다", () => {
    expect(names(searchStations("러브"))).toEqual(["SBS"]);
    expect(names(searchStations("올댓"))).toEqual(["MBC"]);
  });

  it("FM이 들어간 채널을 가진 여러 방송국을 한꺼번에 찾는다", () => {
    const found = names(searchStations("fm"));
    expect(found).toEqual(expect.arrayContaining(["SBS", "KBS", "MBC", "TBS", "EBS"]));
  });

  it("일치하는 방송국이 없으면 빈 목록을 돌려준다", () => {
    expect(searchStations("없는방송국")).toEqual([]);
  });

  it("SBS는 러브FM과 파워FM 두 채널을 가진다", () => {
    const sbs = stations.find((station) => station.name === "SBS");
    expect(names(sbs?.channels ?? [])).toEqual(["러브FM", "파워FM"]);
  });

  it("범위에 정한 36개 채널을 모두 제공한다", () => {
    const total = stations.reduce((sum, station) => sum + station.channels.length, 0);
    expect(total).toBe(36);
  });
});
