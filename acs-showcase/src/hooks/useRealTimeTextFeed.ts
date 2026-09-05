import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealTimeTextInformation } from '@azure/communication-react';
import { SEED_RTT } from '../data/realTimeText';
import { LOCAL_DISPLAY_NAME, LOCAL_USER_ID } from '../data/participants';

const REDUCED = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Plays the seeded real-time text back as if it were arriving — a character at
 * a time, because that is the whole point of the feature.
 *
 * None of this touches the network — it is a timer over static seed data.
 */
export const useRealTimeTextFeed = (
  isRttOn: boolean
): {
  completedRtt: RealTimeTextInformation[];
  inProgressRtt: RealTimeTextInformation[];
  myRtt: RealTimeTextInformation | undefined;
  sendMyRtt: (text: string, isFinalized: boolean) => Promise<void>;
} => {
  const [completedRtt, setCompletedRtt] = useState<RealTimeTextInformation[]>([]);
  const [inProgressRtt, setInProgressRtt] = useState<RealTimeTextInformation[]>([]);
  const [myRtt, setMyRtt] = useState<RealTimeTextInformation | undefined>();
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  /* ── real-time text types itself in, then commits ── */
  useEffect(() => {
    if (!isRttOn) {
      setCompletedRtt([]);
      setInProgressRtt([]);
      return;
    }
    if (REDUCED()) {
      setCompletedRtt(
        SEED_RTT.map((r, i) => ({
          id: i + 1,
          userId: r.userId,
          displayName: r.displayName,
          message: r.message,
          isTyping: false,
          finalizedTimeStamp: new Date(Date.now() - (SEED_RTT.length - i) * 12000),
        }))
      );
      return;
    }

    let cancelled = false;
    let index = 0;
    const local: number[] = [];

    const typeNext = (): void => {
      if (cancelled) {
        return;
      }
      const entry = SEED_RTT[index % SEED_RTT.length];
      const id = Date.now();
      let chars = 0;

      const step = (): void => {
        if (cancelled) {
          return;
        }
        if (chars <= entry.message.length) {
          setInProgressRtt([
            {
              id,
              userId: entry.userId,
              displayName: entry.displayName,
              message: entry.message.slice(0, chars),
              isTyping: true,
              finalizedTimeStamp: new Date(),
            },
          ]);
          chars++;
          local.push(window.setTimeout(step, 45 + Math.random() * 55));
          return;
        }
        // Commits after a pause with no typing, the same way the real feature does.
        setInProgressRtt([]);
        setCompletedRtt((current) => [
          ...current,
          {
            id,
            userId: entry.userId,
            displayName: entry.displayName,
            message: entry.message,
            isTyping: false,
            finalizedTimeStamp: new Date(),
          },
        ]);
        index++;
        local.push(window.setTimeout(typeNext, 2600));
      };

      local.push(window.setTimeout(step, 700));
    };

    typeNext();
    timers.current.push(...local);
    return () => {
      cancelled = true;
      local.forEach((t) => window.clearTimeout(t));
    };
  }, [isRttOn]);

  useEffect(() => clearTimers, [clearTimers]);

  /** What you type in the banner's own composer. */
  const sendMyRtt = useCallback(async (text: string, isFinalized: boolean) => {
    const entry: RealTimeTextInformation = {
      id: 999,
      userId: LOCAL_USER_ID,
      displayName: LOCAL_DISPLAY_NAME,
      message: text,
      isTyping: !isFinalized,
      finalizedTimeStamp: new Date(),
      isMe: true,
    };
    if (isFinalized) {
      setMyRtt(undefined);
      setCompletedRtt((current) => [...current, { ...entry, id: Date.now() }]);
      return;
    }
    setMyRtt(entry);
  }, []);

  return { completedRtt, inProgressRtt, myRtt, sendMyRtt };
};
