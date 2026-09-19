interface GapEntry {
  question: string;
  intent: string;
  count: number;
  lastSeen: Date;
}

const gaps = new Map<string, GapEntry>();

export function logGap(question: string, intent: string): void {
  const key = question.toLowerCase().slice(0, 120);
  const existing = gaps.get(key);
  if (existing) {
    existing.count += 1;
    existing.lastSeen = new Date();
  } else {
    // Cap at 500 entries — evict oldest
    if (gaps.size >= 500) {
      const oldest = [...gaps.entries()].sort(
        (a, b) => a[1].lastSeen.getTime() - b[1].lastSeen.getTime()
      )[0];
      if (oldest) gaps.delete(oldest[0]);
    }
    gaps.set(key, { question, intent, count: 1, lastSeen: new Date() });
  }
}

export function getRecentGaps(): Array<{
  question: string;
  intent: string;
  count: number;
  timestamp: Date;
}> {
  return [...gaps.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
    .map((g) => ({
      question: g.question,
      intent: g.intent,
      count: g.count,
      timestamp: g.lastSeen,
    }));
}
