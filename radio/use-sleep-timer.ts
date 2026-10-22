"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const SLEEP_TIMER_MINUTES = [10, 30, 60] as const;

type Options = {
  /** 재생을 시작했거나 연결 중인 동안 true. 이 값이 false가 되면 타이머는 사라진다. */
  sessionActive: boolean;
  onExpire: () => void;
};

/** 정해진 분이 지나면 onExpire를 한 번 부른다. 남은 시간은 종료 시각에서 계산해 탭 상태와 무관하게 맞는다. */
export function useSleepTimer({ sessionActive, onExpire }: Options) {
  const [timer, setTimer] = useState<{ minutes: number; endsAt: number } | null>(null);
  const [now, setNow] = useState(0);
  const [expired, setExpired] = useState(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // 재생이 끝나면(직접 정지, 오류) 타이머도 함께 끝낸다. 새 재생이 시작되면 종료 안내는 지운다.
  if (!sessionActive && timer) setTimer(null);
  if (sessionActive && expired) setExpired(false);

  useEffect(() => {
    if (!timer) return;
    const timeout = setTimeout(() => {
      setTimer(null);
      setExpired(true);
      onExpireRef.current();
    }, Math.max(0, timer.endsAt - Date.now()));
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(tick);
    };
  }, [timer]);

  const start = useCallback((minutes: number) => {
    const startedAt = Date.now();
    setNow(startedAt);
    setExpired(false);
    setTimer({ minutes, endsAt: startedAt + minutes * 60_000 });
  }, []);

  const cancel = useCallback(() => setTimer(null), []);

  return {
    minutes: timer?.minutes ?? null,
    remainingMs: timer ? Math.max(0, timer.endsAt - now) : null,
    expired,
    start,
    cancel,
  };
}
