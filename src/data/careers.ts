/**
 * CatchZone Careers — role PROFILES (the disciplines behind our work), not
 * live vacancies. Rules: no salaries, no vacancy references, dates or job
 * counts, no JobPosting structured data, no job-board feeds.
 */

export type CareerAreaId = "full-stack" | "qa" | "other";

export const CAREER_AREAS: Record<CareerAreaId, string> = {
  "full-stack": "Full-Stack Software Engineering",
  qa: "Software Quality Assurance",
  other: "Another area of software or product work",
};

export interface RoleProfile {
  id: Exclude<CareerAreaId, "other">;
  title: string;
  discipline: string;
  focus: string;
  summary: string;
  responsibilities: string[];
  skills: string[];
  /** Useful, not required. */
  bonus: string[];
  tags: string[];
}

export const ROLE_PROFILES: RoleProfile[] = [
  {
    id: "full-stack",
    title: "Full-Stack Software Engineer",
    discipline: "Engineering",
    focus:
      "Engineering secure, reliable and polished web and mobile products — from the interface people use to the APIs, data and infrastructure behind it.",
    summary:
      "You take a feature from idea to production: shaping the interface, designing the API, modelling the data and making sure it is secure, fast and maintainable.",
    responsibilities: [
      "Build and maintain modern web and mobile applications",
      "Develop frontend interfaces with React, Next.js and TypeScript",
      "Design, build and integrate secure APIs",
      "Work with relational databases and authentication",
      "Implement appropriate access controls",
      "Integrate external services and third-party APIs",
      "Improve application performance",
      "Write maintainable, testable code",
      "Take part in debugging, QA and deployment preparation",
      "Collaborate on product architecture and user experience",
    ],
    skills: [
      "JavaScript and TypeScript",
      "React and Next.js",
      "Node.js",
      "SQL and relational databases",
      "REST APIs and core web technologies",
      "Git and GitHub",
      "Secure software engineering practices",
      "Testing and debugging",
      "Familiarity with modern cloud infrastructure",
    ],
    bonus: [
      "Mobile or progressive web app experience",
      "Postgres, Supabase or similar managed databases",
      "Automated testing with Playwright or similar tools",
      "Accessibility and performance work",
    ],
    tags: ["React", "Next.js", "TypeScript", "Node.js", "SQL"],
  },
  {
    id: "qa",
    title: "Software Quality Assurance Engineer",
    discipline: "Quality",
    focus: "Helping make sure web and mobile software is reliable, accessible, secure and ready for real users.",
    summary:
      "You plan and run the testing that gives everyone confidence in a release — finding issues early, describing them clearly and checking the fixes.",
    responsibilities: [
      "Create and run manual test plans",
      "Test web and mobile applications",
      "Carry out regression testing",
      "Investigate and document defects",
      "Verify fixes",
      "Test key user journeys end to end",
      "Assess responsive behaviour across devices",
      "Test accessibility and usability",
      "Support automated testing",
      "Help prepare release-readiness reports",
      "Work closely with developers",
    ],
    skills: [
      "Structured manual software testing",
      "Test-case design",
      "Clear, reproducible bug reporting",
      "Browser and mobile QA",
      "API testing fundamentals",
      "Regression testing",
      "Familiarity with Playwright or similar tools",
      "Understanding of accessibility",
      "Clear written communication",
    ],
    bonus: [
      "Experience with WCAG accessibility checks",
      "Basic JavaScript or TypeScript for test scripts",
      "Performance or security testing awareness",
    ],
    tags: ["Test planning", "Regression", "Accessibility", "Playwright"],
  },
];

export const CAREERS_NOTE =
  "These profiles describe the disciplines behind our work. Registering your interest does not mean a vacancy is open and doesn’t guarantee an interview — but we read every message and will be in touch if a suitable opportunity arises.";
