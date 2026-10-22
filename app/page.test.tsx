import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 라디오 제목과 방송국 검색, 전체 방송국 목록을 보여준다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "라디오 라이브" })).toBeInTheDocument();
  expect(screen.getByRole("searchbox", { name: "방송국 또는 채널 검색" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "KBS" })).toBeInTheDocument();
});
