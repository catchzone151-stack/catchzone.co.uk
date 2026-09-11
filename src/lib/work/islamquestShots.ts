/**
 * IslamQuest's real screenshots aren't in "best first" order in the data
 * file — they're just the export order. `screenshots[0]` (1_SS.png) is
 * confirmed to be the app's actual home screen. ScreenCascade's second
 * trajectory slot is the front/centre position (highest depth, full scale
 * and opacity), so the home screen must land there rather than whichever
 * screenshot happens to be next in the array — a stray quiz screen ending
 * up centre-stage reads as arbitrary, not like a deliberate product shot.
 */
export function getIslamQuestHeroShots(screenshots: string[]): string[] {
  if (screenshots.length < 5) return screenshots;
  const home = screenshots[0]!;
  // cascade slot order: [left, front/centre, right, lower, upper]
  return [screenshots[2]!, home, screenshots[4]!, screenshots[6]!, screenshots[1]!];
}
