"use client";

import { useEffect, useState } from "react";

import styles from "./cat.module.css";
import { DancingCharacter } from "./dancing-character";
import { RestingCharacter } from "./resting-character";

function Head({ closedEyes }: { closedEyes?: boolean }) {
  return (
    <>
      <path className={styles.fur} d="M21 19 L22 6 L31 13 Z" />
      <path className={styles.fur} d="M43 19 L42 6 L33 13 Z" />
      <path className={styles.pink} d="M24 15 L24.5 10 L28 13 Z" />
      <path className={styles.pink} d="M40 15 L39.5 10 L36 13 Z" />
      <circle className={styles.fur} cx="32" cy="22" r="12" />
      {closedEyes ? (
        <>
          <path className={styles.line} d="M25.5 21 q2.5 2.5 5 0" />
          <path className={styles.line} d="M33.5 21 q2.5 2.5 5 0" />
        </>
      ) : (
        <>
          <path className={styles.line} d="M25.5 22 q2.5 -3.5 5 0" />
          <path className={styles.line} d="M33.5 22 q2.5 -3.5 5 0" />
        </>
      )}
      <path className={styles.pink} d="M30.5 25 h3 l-1.5 2 z" />
      <path className={styles.line} d="M32 27 v1.2 M32 28.2 q-2 2 -4 0 M32 28.2 q2 2 4 0" />
      <path className={styles.line} d="M22 25 l-6 -1 M22 27 l-6 2 M42 25 l6 -1 M42 27 l6 2" />
    </>
  );
}

/** 춤 한 장면. 팔 각도는 0이 만세, 클수록 아래로 내려간다. */
type Pose = {
  tilt: number;
  lift: number;
  leftArm: number;
  rightArm: number;
  tail: number;
  /** 어느 발을 들었는지. */
  foot: "left" | "right" | "none";
};

const DANCE_POSES: Pose[] = [
  { tilt: -7, lift: 0, leftArm: 0, rightArm: 0, tail: -22, foot: "left" },
  { tilt: 0, lift: -4, leftArm: 55, rightArm: 0, tail: 0, foot: "none" },
  { tilt: 7, lift: 0, leftArm: 0, rightArm: 0, tail: 22, foot: "right" },
  { tilt: 0, lift: -4, leftArm: 0, rightArm: 55, tail: 0, foot: "none" },
  { tilt: -4, lift: 2, leftArm: 95, rightArm: 95, tail: -12, foot: "none" },
  { tilt: 4, lift: -2, leftArm: 30, rightArm: 30, tail: 12, foot: "none" },
];

/** 한 장면이 보이는 시간(ms). 이 간격으로 장면을 갈아 끼워 손으로 그린 애니메이션처럼 보이게 한다. */
const FRAME_MS = 140;

function DanceFrame({ pose }: { pose: Pose }) {
  const leftFootY = pose.foot === "left" ? 55 : 58.5;
  const rightFootY = pose.foot === "right" ? 55 : 58.5;

  return (
    <g transform={`translate(0 ${pose.lift}) rotate(${pose.tilt} 32 58)`}>
      <path
        className={styles.limb}
        d="M43 52 C56 50 58 38 52 33"
        transform={`rotate(${pose.tail} 43 52)`}
      />
      <ellipse className={styles.fur} cx="26" cy={leftFootY} rx="5.5" ry="3.2" />
      <ellipse className={styles.fur} cx="38" cy={rightFootY} rx="5.5" ry="3.2" />
      <ellipse className={styles.fur} cx="32" cy="46" rx="11" ry="13" />
      <ellipse className={styles.furLight} cx="32" cy="49" rx="6.5" ry="8.5" />
      <path
        className={styles.limb}
        d="M23 40 C16 36 13 30 15 24"
        transform={`rotate(${-pose.leftArm} 23 40)`}
      />
      <path
        className={styles.limb}
        d="M41 40 C48 36 51 30 49 24"
        transform={`rotate(${pose.rightArm} 41 40)`}
      />
      <Head />
    </g>
  );
}

function DancingCat() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setFrame((current) => (current + 1) % DANCE_POSES.length), FRAME_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={styles.walker}>
      <svg viewBox="0 0 64 64" role="img" aria-label="춤추는 고양이" className="size-full">
        <DanceFrame pose={DANCE_POSES[frame]} />
        <text className={`${styles.glyph} ${styles.note}`} x="50" y="14" aria-hidden="true">
          ♪
        </text>
        <text className={`${styles.glyph} ${styles.note} ${styles.noteLate}`} x="6" y="16" aria-hidden="true">
          ♫
        </text>
      </svg>
    </span>
  );
}

function RestingCat() {
  return (
    <span className={styles.sitter}>
      <svg viewBox="0 0 64 64" role="img" aria-label="의자에서 쉬는 고양이" className="size-full">
        <rect className={styles.wood} x="12" y="14" width="5" height="46" rx="2" />
        <rect className={styles.wood} x="10" y="11" width="9" height="5" rx="2" />
        <rect className={styles.wood} x="12" y="42" width="40" height="5" rx="2" />
        <rect className={styles.wood} x="15" y="47" width="4" height="13" rx="1.5" />
        <rect className={styles.wood} x="46" y="47" width="4" height="13" rx="1.5" />
        <g className={styles.breathe}>
          <path className={styles.limb} d="M44 40 C54 41 57 48 52 55" />
          <ellipse className={styles.fur} cx="33" cy="35" rx="12" ry="8.5" />
          <ellipse className={styles.furLight} cx="39" cy="41" rx="4.5" ry="2.6" />
          <Head closedEyes />
        </g>
        <text className={`${styles.glyph} ${styles.zzz}`} x="47" y="16" aria-hidden="true">
          z
        </text>
        <text className={`${styles.glyph} ${styles.zzz} ${styles.zzzLate}`} x="54" y="9" aria-hidden="true">
          Z
        </text>
      </svg>
    </span>
  );
}

/**
 * 재생하는 동안(연결 중 포함)에는 제공된 캐릭터 이미지가 춤추며 돌아다니고, 멈춰 있으면 앉은 모습의 이미지가 쉰다.
 * 각 이미지가 없으면 춤추는 고양이, 의자에 앉아 쉬는 고양이가 대신 나온다.
 */
export function Cat({ state }: { state: "dancing" | "resting" }) {
  const [danceImageMissing, setDanceImageMissing] = useState(false);
  const [restImageMissing, setRestImageMissing] = useState(false);

  return (
    <div className={styles.stage}>
      {state === "resting" ? (
        restImageMissing ? (
          <RestingCat />
        ) : (
          <RestingCharacter onMissing={() => setRestImageMissing(true)} />
        )
      ) : danceImageMissing ? (
        <DancingCat />
      ) : (
        <DancingCharacter onMissing={() => setDanceImageMissing(true)} />
      )}
    </div>
  );
}
