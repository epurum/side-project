"use client";

import Image from "next/image";

import styles from "./cat.module.css";

/** 사용자가 제공한 앉은 모습의 이미지. 저작권 때문에 저장소에는 올리지 않고(.gitignore) 각자 이 위치에 둔다. */
const RESTING_SRC = "/character/resting.jpg";

type Props = {
  /** 이미지 파일이 없거나 불러오지 못했을 때 부른다. */
  onMissing: () => void;
};

export function RestingCharacter({ onMissing }: Props) {
  return (
    <span className={styles.sitter}>
      <span role="img" aria-label="쉬는 캐릭터" className="block size-full">
        <Image
          src={RESTING_SRC}
          alt=""
          width={96}
          height={96}
          unoptimized
          draggable={false}
          className={`${styles.character} ${styles.restingImage}`}
          onError={onMissing}
        />
      </span>
    </span>
  );
}
