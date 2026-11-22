import styles from "./ProposalCelebration.module.css";

const HeartIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const ProposalCelebration = () => {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.glowAura} />

      {/* Floating love & kiss trail */}
      <HeartIcon className={`${styles.kissHeart} ${styles.kissOne}`} />
      <HeartIcon className={`${styles.kissHeart} ${styles.kissTwo}`} />
      <HeartIcon className={`${styles.kissHeart} ${styles.kissThree}`} />
      <HeartIcon className={`${styles.kissHeart} ${styles.kissFour}`} />
      <span className={`${styles.spark} ${styles.sparkOne}`}>✦</span>
      <span className={`${styles.spark} ${styles.sparkTwo}`}>♥</span>
      <span className={`${styles.spark} ${styles.sparkThree}`}>✦</span>

      {/* Couple illustration: leaning in & blowing a kiss */}
      <svg
        viewBox="0 0 260 130"
        className={styles.coupleSvg}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="122" cy="118" rx="76" ry="7" fill="rgba(20, 17, 24, 0.14)" />

        {/* Partner A (left, leaning right & blowing kiss) */}
        <g className={styles.partnerLeft}>
          {/* Torso */}
          <path
            d="M66 114C66 90 78 78 96 78C112 78 122 89 124 114H66Z"
            fill="#1f1926"
          />
          {/* Head */}
          <circle cx="96" cy="56" r="17" fill="#f7c59f" />
          {/* Hair */}
          <path
            d="M79 54C79 41 88 35 99 36C108 37 113 43 113 50C106 47 95 47 85 52L79 54Z"
            fill="#1f1926"
          />
          {/* Kissing mouth / pucker */}
          <path
            d="M111 60C114 59 116 61 113 63C115 64 114 66 111 65"
            stroke="#be185d"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Hand raised blowing kiss */}
          <path
            d="M114 88C123 82 128 74 126 68"
            stroke="#f7c59f"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="127" cy="66" r="4" fill="#f7c59f" />
        </g>

        {/* Partner B (right, smiling & leaning toward kiss) */}
        <g className={styles.partnerRight}>
          {/* Torso */}
          <path
            d="M134 114C136 88 147 77 164 77C182 77 194 90 194 114H134Z"
            fill="#831843"
          />
          {/* Head */}
          <circle cx="164" cy="55" r="17" fill="#eab38c" />
          {/* Hair */}
          <path
            d="M147 53C147 39 157 34 169 35C178 36 183 43 183 52C174 47 160 47 147 53Z"
            fill="#3b0764"
          />
          {/* Happy smile */}
          <path
            d="M153 60C156 64 161 64 164 60"
            stroke="#500724"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Rosy cheek */}
          <circle cx="151" cy="59" r="3.5" fill="#fb7185" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
};