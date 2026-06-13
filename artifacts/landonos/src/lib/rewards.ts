import { Level } from "./types";

export interface LevelDef {
  level: Level;
  minPoints: number;
  description: string;
}

export const LEVELS: LevelDef[] = [
  { level: "Research Trainee", minPoints: 0, description: "Learning the fundamentals of responsible research." },
  { level: "Source Finder", minPoints: 750, description: "Reliably locating and rating quality sources." },
  { level: "Brief Builder", minPoints: 1750, description: "Turning research into clear, structured briefs." },
  { level: "Compliance Research Assistant", minPoints: 3000, description: "Handling compliance topics with verified sources." },
  { level: "Business Intelligence Operator", minPoints: 4500, description: "Producing decision-ready business intelligence." },
  { level: "Executive Research Analyst", minPoints: 6500, description: "Delivering leadership-ready analysis end to end." },
];

export function levelForPoints(points: number): LevelDef {
  let current = LEVELS[0];
  for (const def of LEVELS) {
    if (points >= def.minPoints) current = def;
  }
  return current;
}

export function nextLevelFor(points: number): LevelDef | null {
  for (const def of LEVELS) {
    if (def.minPoints > points) return def;
  }
  return null;
}

export interface LevelProgress {
  current: LevelDef;
  next: LevelDef | null;
  pointsIntoLevel: number;
  pointsForNext: number;
  percent: number;
}

export function levelProgress(points: number): LevelProgress {
  const current = levelForPoints(points);
  const next = nextLevelFor(points);
  if (!next) {
    return { current, next: null, pointsIntoLevel: 0, pointsForNext: 0, percent: 100 };
  }
  const span = next.minPoints - current.minPoints;
  const into = points - current.minPoints;
  const percent = span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 0;
  return { current, next, pointsIntoLevel: into, pointsForNext: span, percent };
}
