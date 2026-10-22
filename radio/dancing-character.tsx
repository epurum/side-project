"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./cat.module.css";

/** 사용자가 제공한 캐릭터 이미지. 저작권 때문에 저장소에는 올리지 않고(.gitignore) 각자 이 위치에 둔다. */
const CHARACTER_SRC = "/character/dancer.png";

/** 한 장짜리 그림에 이동·회전·찌그러짐을 줘서 만든 춤 동작. */
type Move = { rotate: number; y: number; scaleX: number; scaleY: number };

const DANCE_MOVES: Move[] = [
  { rotate: -12, y: 0, scaleX: 1, scaleY: 1 },
  { rotate: 0, y: -6, scaleX: 0.94, scaleY: 1.08 },
  { rotate: 12, y: 0, scaleX: 1, scaleY: 1 },
  { rotate: 0, y: 2, scaleX: 1.1, scaleY: 0.88 },
  { rotate: -8, y: -3, scaleX: 1, scaleY: 1.04 },
  { rotate: 8, y: -3, scaleX: 1, scaleY: 1.04 },
];

const FRAME_MS = 140;

type Props = {
  /** 이미지 파일이 없거나 불러오지 못했을 때 부른다. */
  onMissing: () => void;
};

export function DancingCharacter({ onMissing }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setFrame((current) => (current + 1) % DANCE_MOVES.length), FRAME_MS);
    return () => clearInterval(timer);
  }, []);

  const move = DANCE_MOVES[frame];

  return (
    <span className={styles.walker}>
      <span role="img" aria-label="춤추는 캐릭터" className="block size-full">
        <Image
          src={CHARACTER_SRC}
          alt=""
          width={96}
          height={96}
          unoptimized
          draggable={false}
          className={styles.character}
          style={{
            transform: `translateY(${move.y}px) rotate(${move.rotate}deg) scale(${move.scaleX}, ${move.scaleY})`,
          }}
          onError={onMissing}
        />
      </span>
    </span>
  );
}
