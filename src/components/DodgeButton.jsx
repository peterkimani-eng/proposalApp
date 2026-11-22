import { useState } from "react";
import styles from "./DodgeButton.module.css";

const ESCALATION_LABELS = [
  "No",
  "Are you sure?",
  "Think again!",
  "Really no?",
  "Nice try",
];

export const DodgeButton = ({
  mode = "teleport",
  label = "No",
  onAttemptDodge,
}) => {
  const [attempts, setAttempts] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const triggerDodge = (event) => {
    if (event) {
      event.preventDefault();
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (mode === "teleport" || mode === "escalate") {
      const directionX = nextAttempts % 2 === 0 ? 1 : -1;
      const directionY = nextAttempts % 3 === 0 ? -1 : 1;
      const randomX = directionX * (55 + ((nextAttempts * 37) % 85));
      const randomY = directionY * (20 + ((nextAttempts * 23) % 55));
      setOffset({ x: randomX, y: randomY });
    }

    if (typeof onAttemptDodge === "function") {
      onAttemptDodge(nextAttempts);
    }
  };

  const scale =
    mode === "shrink" ? Math.max(0.45, 1 - attempts * 0.12) : 1;

  const displayLabel =
    mode === "escalate"
      ? ESCALATION_LABELS[Math.min(attempts, ESCALATION_LABELS.length - 1)]
      : label;

  const toneClass =
    attempts >= 3
      ? styles.warning
      : attempts >= 1
        ? styles.subtle
        : "";

  return (
    <button
      type="button"
      onMouseEnter={triggerDodge}
      onFocus={triggerDodge}
      onClick={triggerDodge}
      className={`${styles.dodgeBtn} ${styles.evading} ${toneClass}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      }}
    >
      {displayLabel}
    </button>
  );
};