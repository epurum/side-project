import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DevicePreview } from "@/components/device-preview";

const frame = () => screen.getByRole("group", { name: "화면 미리보기" });

describe("화면 크기 전환", () => {
  it("처음에는 데스크탑 크기이고 모바일로 바꾸는 버튼이 있다", () => {
    render(
      <DevicePreview>
        <p>내용</p>
      </DevicePreview>
    );

    expect(frame()).toHaveAttribute("data-device", "desktop");
    expect(screen.getByRole("button", { name: "모바일 화면으로 보기" })).toBeInTheDocument();
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("버튼을 누르면 모바일 크기가 되고, 한 번 더 누르면 데스크탑 크기로 돌아온다", () => {
    render(
      <DevicePreview>
        <p>내용</p>
      </DevicePreview>
    );

    fireEvent.click(screen.getByRole("button", { name: "모바일 화면으로 보기" }));
    expect(frame()).toHaveAttribute("data-device", "mobile");
    expect(screen.queryByRole("button", { name: "모바일 화면으로 보기" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "데스크탑 화면으로 보기" }));
    expect(frame()).toHaveAttribute("data-device", "desktop");
    expect(screen.getByRole("button", { name: "모바일 화면으로 보기" })).toBeInTheDocument();
  });

  it("크기를 바꿔도 안의 내용은 다시 만들어지지 않아 입력과 재생 상태가 유지된다", () => {
    render(
      <DevicePreview>
        <input aria-label="검색" />
      </DevicePreview>
    );
    const input = screen.getByRole("textbox", { name: "검색" });
    fireEvent.change(input, { target: { value: "sbs" } });

    fireEvent.click(screen.getByRole("button", { name: "모바일 화면으로 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "데스크탑 화면으로 보기" }));

    expect(screen.getByRole("textbox", { name: "검색" })).toBe(input);
    expect(input).toHaveValue("sbs");
  });
});
