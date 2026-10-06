/**
 * The approved IslamQuest showcase — eight real app screens, in this exact
 * order. Each image is the app screen extracted (uncropped, unscaled) from
 * the approved Play Store frames; `title` / `subtitle` are those frames'
 * own captions, rendered as text so they stay readable and accessible.
 * Used by the homepage and /work Featured Build and the case study.
 */
export interface IslamQuestScreen {
  src: string;
  title: string;
  subtitle: string;
  alt: string;
}

const BASE = "/assets/images/islamquest/showcase";

/** Native size of every extracted screen (px). */
export const ISLAMQUEST_SCREEN_SIZE = { width: 696, height: 1480 } as const;

export const ISLAMQUEST_SCREENS: IslamQuestScreen[] = [
  {
    src: `${BASE}/01-learn-islam.webp`,
    title: "Learn Islam, one step at a time",
    subtitle: "Qur’an, worship, quests and structured learning",
    alt: "IslamQuest home screen with Qur’an, worship tools, a daily quest and lesson paths",
  },
  {
    src: `${BASE}/02-read-the-quran.webp`,
    title: "Read the Qur’an your way",
    subtitle: "Uthmani text, translation, bookmarks and auto-scroll",
    alt: "IslamQuest Qur’an reader showing Surah Al-Baqarah in Arabic with English translation",
  },
  {
    src: `${BASE}/03-quran-habit.webp`,
    title: "Build a consistent Qur’an habit",
    subtitle: "Continue reading, set goals and track progress",
    alt: "IslamQuest Qur’an screen with continue reading, a daily reading goal and surah browser",
  },
  {
    src: `${BASE}/04-dua-adhkar.webp`,
    title: "Authentic Dua & Adhkar",
    subtitle: "Arabic, meanings, references and easy sharing",
    alt: "IslamQuest dua screen with Arabic text, transliteration, English meaning and reference",
  },
  {
    src: `${BASE}/05-daily-adhkar.webp`,
    title: "Daily adhkar made simple",
    subtitle: "Clear categories, bookmarks and guided remembrance",
    alt: "IslamQuest morning remembrance list with numbered adhkar and bookmarks",
  },
  {
    src: `${BASE}/06-worship-tools.webp`,
    title: "Daily worship tools in one place",
    subtitle: "Prayer tracker, Tasbeeh, Zakat and Dua & Adhkar",
    alt: "IslamQuest worship tools: Dua & Adhkar, My Prayer, Tasbeeh and Zakat Calculator",
  },
  {
    src: `${BASE}/07-test-what-you-learn.webp`,
    title: "Test what you learn",
    subtitle: "Interactive quizzes that strengthen your knowledge",
    alt: "IslamQuest quiz question with four multiple-choice answers",
  },
  {
    src: `${BASE}/08-learn-together.webp`,
    title: "Learn together, stay motivated",
    subtitle: "Friends, leaderboards and global challenges",
    alt: "IslamQuest friends leaderboard with ranked learners and XP",
  },
];
