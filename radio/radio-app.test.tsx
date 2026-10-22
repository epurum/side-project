import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RadioApp, type AudioEngine, type ResolvedStream } from "@/radio";

function setup(options: { failResolveFor?: string } = {}) {
  const events: string[] = [];
  const engine: AudioEngine = {
    play: vi.fn(async (stream: ResolvedStream) => {
      events.push(`play ${stream.url}`);
    }),
    stop: vi.fn(() => {
      events.push("stop");
    }),
  };
  const resolve = vi.fn(async (source: { type: string; channelId?: string; channelCode?: string }) => {
    const key = source.channelId ?? source.channelCode ?? source.type;
    if (key === options.failResolveFor) throw new Error("주소 조회 실패");
    return { url: `https://stream.test/${key}`, protocol: "hls" as const };
  });
  render(<RadioApp engine={engine} resolve={resolve} />);
  return { engine, resolve, events };
}

const search = (value: string) =>
  fireEvent.change(screen.getByRole("searchbox", { name: "방송국 또는 채널 검색" }), {
    target: { value },
  });
const station = (name: string) =>
  within(screen.getByRole("group", { name: "방송국" })).getByRole("button", { name });
const bar = () => screen.getByRole("status", { name: "재생 상태" });
const channel = (name: string) =>
  within(screen.getByRole("group", { name: /채널$/ })).getByRole("button", { name });

describe("방송국 검색과 선택", () => {
  it("처음에는 모든 방송국이 보이고 재생 중인 채널은 없다", () => {
    setup();

    expect(within(screen.getByRole("group", { name: "방송국" })).getAllByRole("button")).toHaveLength(18);
    expect(screen.getByText("재생 중인 채널이 없습니다")).toBeInTheDocument();
    expect(bar()).not.toHaveTextContent(/재생 중$/);
    expect(screen.queryByRole("button", { name: "정지" })).not.toBeInTheDocument();
  });

  it("sbs를 검색해 선택하면 러브FM과 파워FM이 나오고, 선택만으로는 재생되지 않는다", () => {
    const { engine } = setup();

    search("sbs");
    expect(within(screen.getByRole("group", { name: "방송국" })).getAllByRole("button")).toHaveLength(1);
    fireEvent.click(station("SBS"));

    expect(channel("러브FM")).toBeInTheDocument();
    expect(channel("파워FM")).toBeInTheDocument();
    expect(engine.play).not.toHaveBeenCalled();
  });

  it("일치하는 방송국이 없으면 결과 없음을 알린다", () => {
    setup();

    search("없는방송국");

    expect(screen.getByText("일치하는 방송국이 없습니다")).toBeInTheDocument();
  });
});

describe("채널 재생과 정지", () => {
  it("채널을 누르면 그 채널의 라이브 방송이 재생되고 재생 중으로 표시된다", async () => {
    const { engine } = setup();
    fireEvent.click(station("SBS"));

    fireEvent.click(channel("러브FM"));

    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));
    expect(engine.play).toHaveBeenCalledWith({ url: "https://stream.test/S08", protocol: "hls" }, expect.any(Function));
    expect(channel("러브FM")).toHaveAttribute("aria-pressed", "true");
    expect(channel("파워FM")).toHaveAttribute("aria-pressed", "false");
  });

  it("재생 중인 채널을 다시 누르면 정지한다", async () => {
    const { engine } = setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));

    fireEvent.click(channel("러브FM"));

    expect(engine.stop).toHaveBeenCalled();
    expect(bar()).not.toHaveTextContent("SBS 러브FM 재생 중");
    expect(channel("러브FM")).toHaveAttribute("aria-pressed", "false");
  });

  it("재생 중에 다른 채널을 누르면 이전 채널을 멈추고 새 채널만 재생한다", async () => {
    const { events } = setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));

    fireEvent.click(channel("파워FM"));

    await waitFor(() => expect(bar()).toHaveTextContent("SBS 파워FM 재생 중"));
    expect(events).toEqual(["play https://stream.test/S08", "stop", "play https://stream.test/S07"]);
    expect(bar()).not.toHaveTextContent("SBS 러브FM 재생 중");
  });

  it("재생 중에 다른 방송국을 고르거나 검색어를 바꿔도 재생이 이어지고 정지할 수 있다", async () => {
    const { engine } = setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));

    search("kbs");
    fireEvent.click(station("KBS"));

    expect(bar()).toHaveTextContent("SBS 러브FM 재생 중");
    expect(engine.stop).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    expect(engine.stop).toHaveBeenCalled();
    expect(bar()).not.toHaveTextContent("SBS 러브FM 재생 중");
  });
});

describe("재생 상태 표시줄의 글자", () => {
  it("재생 중에는 화면에 채널 이름만 보이고 상태 글자는 스크린 리더에만 전달된다", async () => {
    setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));

    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));

    expect(within(bar()).getByText("SBS 러브FM")).toBeInTheDocument();
    expect(within(bar()).getByText("재생 중")).toHaveClass("sr-only");
  });

  it("연결 중에도 상태 글자는 화면에 보이지 않는다", () => {
    setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));

    expect(within(bar()).getByText("SBS 러브FM")).toBeInTheDocument();
    expect(within(bar()).getByText("연결 중")).toHaveClass("sr-only");
  });

  it("정지하면 채널 이름만 남고 정지됨 글자는 화면에 보이지 않는다", async () => {
    setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));

    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    expect(within(bar()).getByText("SBS 러브FM")).toBeInTheDocument();
    expect(within(bar()).getByText("정지됨")).toHaveClass("sr-only");
  });
});

describe("재생 상태 표시줄의 고양이", () => {
  const resting = () => screen.queryByRole("img", { name: "의자에서 쉬는 고양이" });
  const dancing = () => screen.queryByRole("img", { name: "춤추는 고양이" });

  it("재생 중인 채널이 없는 처음 상태에서는 아무 고양이도 보이지 않는다", () => {
    setup();

    expect(resting()).not.toBeInTheDocument();
    expect(dancing()).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("채널을 누르면 춤추기 시작하고, 정지하면 다시 의자에 앉아 쉰다", async () => {
    setup();
    fireEvent.click(station("SBS"));

    fireEvent.click(channel("러브FM"));
    expect(await screen.findByRole("img", { name: "춤추는 고양이" })).toBeInTheDocument();
    expect(resting()).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "정지" }));
    expect(resting()).toBeInTheDocument();
    expect(dancing()).not.toBeInTheDocument();
  });

  it("연결 중에도 춤추고, 재생에 실패해 채널이 없어지면 고양이도 사라진다", async () => {
    setup({ failResolveFor: "S08" });
    fireEvent.click(station("SBS"));

    fireEvent.click(channel("러브FM"));
    expect(dancing()).toBeInTheDocument();

    await screen.findByRole("alert");
    expect(resting()).not.toBeInTheDocument();
    expect(dancing()).not.toBeInTheDocument();
  });
});

describe("재생 실패", () => {
  it("주소를 받지 못하면 그 채널에 오류를 보이고, 다른 채널은 계속 쓸 수 있으며, 다시 시도할 수 있다", async () => {
    setup({ failResolveFor: "S08" });
    fireEvent.click(station("SBS"));

    fireEvent.click(channel("러브FM"));

    expect(await screen.findByRole("alert")).toHaveTextContent("SBS 러브FM");
    expect(bar()).not.toHaveTextContent("SBS 러브FM 재생 중");

    fireEvent.click(channel("파워FM"));
    await waitFor(() => expect(bar()).toHaveTextContent("SBS 파워FM 재생 중"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("취침 타이머", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const elapse = (ms: number) =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  const minutes = (count: number) => count * 60_000;
  const timerOption = (name: string) =>
    within(screen.getByRole("group", { name: "취침 타이머" })).getByRole("button", { name });
  const startPlaying = async (stationName = "SBS", channelName = "러브FM") => {
    fireEvent.click(station(stationName));
    fireEvent.click(channel(channelName));
    await elapse(0);
  };

  it("재생 중이 아닐 때는 타이머를 걸 수 없다", () => {
    setup();

    expect(screen.queryByRole("group", { name: "취침 타이머" })).not.toBeInTheDocument();
  });

  it("재생 중에는 10분, 30분, 60분 중에서 고를 수 있다", async () => {
    setup();
    await startPlaying();

    expect(timerOption("10분")).toBeInTheDocument();
    expect(timerOption("30분")).toBeInTheDocument();
    expect(timerOption("60분")).toBeInTheDocument();
  });

  it("10분을 고르면 남은 시간이 보이고, 10분이 지나면 재생이 멈추고 타이머로 종료됐음을 알린다", async () => {
    const { engine } = setup();
    await startPlaying();

    fireEvent.click(timerOption("10분"));
    expect(screen.getByText("남은 시간 10:00")).toBeInTheDocument();

    await elapse(minutes(9) + 59_000);
    expect(engine.stop).not.toHaveBeenCalled();
    expect(screen.getByText("남은 시간 0:01")).toBeInTheDocument();

    await elapse(1_000);
    expect(engine.stop).toHaveBeenCalledTimes(1);
    expect(bar()).not.toHaveTextContent("SBS 러브FM 재생 중");
    expect(screen.getByText("취침 타이머로 종료되었습니다")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "취침 타이머" })).not.toBeInTheDocument();
  });

  it("30분과 60분도 정해진 시간이 지난 뒤에 멈춘다", async () => {
    const { engine } = setup();
    await startPlaying();

    fireEvent.click(timerOption("30분"));
    await elapse(minutes(29));
    expect(engine.stop).not.toHaveBeenCalled();
    await elapse(minutes(1));
    expect(engine.stop).toHaveBeenCalledTimes(1);

    await startPlaying();
    fireEvent.click(timerOption("60분"));
    await elapse(minutes(59));
    expect(engine.stop).toHaveBeenCalledTimes(1);
    await elapse(minutes(1));
    expect(engine.stop).toHaveBeenCalledTimes(2);
  });

  it("타이머가 걸린 채로 채널을 바꿔도 타이머는 이어진다", async () => {
    const { engine } = setup();
    await startPlaying();
    fireEvent.click(timerOption("10분"));
    await elapse(minutes(5));

    fireEvent.click(channel("파워FM"));
    await elapse(0);
    expect(bar()).toHaveTextContent("SBS 파워FM 재생 중");
    expect(screen.getByText("남은 시간 5:00")).toBeInTheDocument();
    vi.mocked(engine.stop).mockClear();

    await elapse(minutes(5));
    expect(engine.stop).toHaveBeenCalledTimes(1);
    expect(bar()).not.toHaveTextContent("SBS 파워FM 재생 중");
  });

  it("다른 시간을 고르면 이전 타이머를 대체한다", async () => {
    const { engine } = setup();
    await startPlaying();
    fireEvent.click(timerOption("10분"));
    await elapse(minutes(1));

    fireEvent.click(timerOption("60분"));
    expect(screen.getByText("남은 시간 60:00")).toBeInTheDocument();

    await elapse(minutes(10));
    expect(engine.stop).not.toHaveBeenCalled();
  });

  it("타이머를 끄면 시간이 지나도 멈추지 않는다", async () => {
    const { engine } = setup();
    await startPlaying();
    fireEvent.click(timerOption("10분"));

    fireEvent.click(screen.getByRole("button", { name: "타이머 끄기" }));
    await elapse(minutes(20));

    expect(engine.stop).not.toHaveBeenCalled();
    expect(bar()).toHaveTextContent("SBS 러브FM 재생 중");
    expect(screen.queryByText(/남은 시간/)).not.toBeInTheDocument();
  });

  it("직접 정지하면 타이머가 사라져 다시 재생해도 이전 타이머로 멈추지 않는다", async () => {
    setup();
    await startPlaying();
    fireEvent.click(timerOption("10분"));
    await elapse(minutes(1));

    fireEvent.click(screen.getByRole("button", { name: "정지" }));
    await elapse(minutes(1));
    fireEvent.click(channel("러브FM"));
    await elapse(0);
    await elapse(minutes(30));

    expect(bar()).toHaveTextContent("SBS 러브FM 재생 중");
    expect(screen.queryByText("취침 타이머로 종료되었습니다")).not.toBeInTheDocument();
  });
});

describe("정지 상태와 재생 버튼", () => {
  const startPlaying = async () => {
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));
  };

  it("정지하면 채널 이름은 정지됨으로 남고 정지 버튼이 재생 버튼으로 바뀐다", async () => {
    const { engine } = setup();
    await startPlaying();

    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    expect(engine.stop).toHaveBeenCalled();
    expect(bar()).toHaveTextContent("SBS 러브FM 정지됨");
    expect(screen.queryByRole("button", { name: "정지" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "재생" })).toBeInTheDocument();
  });

  it("채널 목록에서 다시 눌러 멈춘 경우에도 같은 정지 상태가 된다", async () => {
    setup();
    await startPlaying();

    fireEvent.click(channel("러브FM"));

    expect(bar()).toHaveTextContent("SBS 러브FM 정지됨");
    expect(screen.getByRole("button", { name: "재생" })).toBeInTheDocument();
  });

  it("재생 버튼을 누르면 같은 채널을 다시 재생하고 재생 버튼은 정지 버튼으로 돌아온다", async () => {
    const { events } = setup();
    await startPlaying();
    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    fireEvent.click(screen.getByRole("button", { name: "재생" }));

    await waitFor(() => expect(bar()).toHaveTextContent("SBS 러브FM 재생 중"));
    expect(events).toEqual(["play https://stream.test/S08", "stop", "play https://stream.test/S08"]);
    expect(screen.getByRole("button", { name: "정지" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "재생" })).not.toBeInTheDocument();
  });

  it("정지된 채널이 있어도 목록에서 다른 채널을 눌러 바로 재생할 수 있다", async () => {
    setup();
    await startPlaying();
    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    fireEvent.click(channel("파워FM"));

    await waitFor(() => expect(bar()).toHaveTextContent("SBS 파워FM 재생 중"));
  });

  it("정지 상태에서는 취침 타이머를 걸 수 없다", async () => {
    setup();
    await startPlaying();

    fireEvent.click(screen.getByRole("button", { name: "정지" }));

    expect(screen.queryByRole("group", { name: "취침 타이머" })).not.toBeInTheDocument();
  });
});

describe("취침 타이머 종료 뒤", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const elapse = (ms: number) =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });

  it("채널은 정지됨으로 남고, 재생 버튼으로 다시 들을 수 있다", async () => {
    setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await elapse(0);
    fireEvent.click(
      within(screen.getByRole("group", { name: "취침 타이머" })).getByRole("button", { name: "10분" })
    );

    await elapse(10 * 60_000);
    expect(screen.getByText("취침 타이머로 종료되었습니다")).toBeInTheDocument();
    expect(bar()).toHaveTextContent("SBS 러브FM 정지됨");

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    await elapse(0);

    expect(bar()).toHaveTextContent("SBS 러브FM 재생 중");
    expect(screen.queryByText("취침 타이머로 종료되었습니다")).not.toBeInTheDocument();
  });
});

describe("춤추는 고양이의 동작 그림", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const elapse = (ms: number) =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });

  it("여러 장의 서로 다른 그림을 돌려가며 보여준다", async () => {
    setup();
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await elapse(0);

    const frames = new Set<string>();
    for (let step = 0; step < 12; step++) {
      frames.add(screen.getByRole("img", { name: "춤추는 고양이" }).innerHTML);
      await elapse(150);
    }

    expect(frames.size).toBeGreaterThanOrEqual(4);
  });

  const playThenStop = async () => {
    fireEvent.click(station("SBS"));
    fireEvent.click(channel("러브FM"));
    await elapse(0);
    fireEvent.click(screen.getByRole("button", { name: "정지" }));
  };

  it("쉬고 있을 때는 그림이 바뀌지 않는다", async () => {
    setup();
    await playThenStop();
    const before = screen.getByRole("img", { name: "의자에서 쉬는 고양이" }).innerHTML;

    await elapse(2_000);

    expect(screen.getByRole("img", { name: "의자에서 쉬는 고양이" }).innerHTML).toBe(before);
  });
});
