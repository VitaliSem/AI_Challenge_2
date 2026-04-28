// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityCategory =
  | 'public speaking'
  | 'education'
  | 'university partnership';

export interface Activity {
  name: string;
  category: ActivityCategory;
  date: string;
  recognitionPoints: number;
}

export interface User {
  firstName: string;
  lastName: string;
  position: string;
  unit: string;
  activities: Activity[];
}

// ─── Seeded RNG (deterministic mock data) ────────────────────────────────────

let seed = 42;

function seededRandom(): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 4294967295;
}

function randInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function randItem<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

// ─── Source data ─────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry',
  'Irene', 'Jack', 'Karen', 'Leo', 'Mia', 'Nathan', 'Olivia', 'Paul',
  'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xander',
  'Yara', 'Zach', 'Amelia', 'Ben', 'Clara', 'Derek', 'Elena', 'Felix',
  'Gina', 'Hugo', 'Isabella', 'James', 'Kate', 'Liam', 'Maya', 'Nick',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
  'White', 'Harris', 'Martin', 'Thompson', 'Lee', 'Walker', 'Hall',
  'Allen', 'Young', 'King', 'Wright', 'Scott', 'Torres', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Carter', 'Mitchell', 'Roberts',
  'Campbell', 'Evans', 'Turner', 'Phillips',
];

const POSITIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'Principal Software Engineer',
  'Group Manager',
  'QA Engineer',
  'Senior QA Engineer',
  'Lead QA Engineer',
  'Product Manager',
  'Senior Product Manager',
  'UX Designer',
  'Senior UX Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Senior DevOps Engineer',
  'Business Analyst',
  'Scrum Master',
  'Technical Lead',
  'Engineering Manager',
  'Solution Architect',
];

const UNITS = [
  'US.U1.D1', 'US.U1.D2', 'US.U2.D1', 'US.U2.D2', 'US.U3.D1',
  'UK.U1.D1', 'UK.U1.D2', 'UK.U2.D1', 'UK.U2.D2',
  'DE.U1.D1', 'DE.U1.D2', 'DE.U2.D1',
  'FR.U1.D1', 'FR.U1.D2', 'FR.U2.D1',
  'PL.U1.D1', 'PL.U1.D2', 'PL.U2.D1',
  'UA.U1.D1', 'UA.U1.D2', 'UA.U2.D1', 'UA.U2.D2',
  'CA.U1.D1', 'CA.U1.D2',
  'AU.U1.D1', 'AU.U1.D2',
];

const ACTIVITIES_BY_CATEGORY: Record<ActivityCategory, string[]> = {
  'public speaking': [
    'Offline meetup about AI technologies',
    'Tech talk on cloud computing',
    'Conference presentation on microservices',
    'Keynote at local developer meetup',
    'Panel discussion on software quality',
    'Lightning talk on TypeScript best practices',
    'Presentation on observability and monitoring',
    'Talk on distributed systems design',
    'Webinar on modern frontend architecture',
    'Presentation on DevSecOps practices',
    'Roundtable discussion on engineering culture',
    'Talk on open-source contribution strategies',
  ],
  'education': [
    'Lecture about JS new features',
    'Workshop on React best practices',
    'Code review training session',
    'TypeScript deep-dive workshop',
    'Docker and containerisation workshop',
    'Git advanced techniques training',
    'Agile methodologies training',
    'AI digest presentation',
    'Mentoring session with junior engineer',
    'CI/CD pipeline workshop',
    'Kubernetes fundamentals workshop',
    'Python for data analysis training',
    'Accessibility in web development workshop',
    'Performance optimisation training',
  ],
  'university partnership': [
    'Guest lecture on software engineering at university',
    'Student mentoring program coordination',
    'Hackathon co-organisation with university',
    'Internship program coordination and interviews',
    'University career day participation',
    'Curriculum review collaboration with faculty',
    'Guest lecture on AI and machine learning',
    'Student project review and feedback session',
    'Scholarship programme committee participation',
    'Research collaboration kickoff workshop',
  ],
};

const CATEGORIES: ActivityCategory[] = [
  'public speaking',
  'education',
  'university partnership',
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Days in each month (non-leap for 2025, leap for 2026)
const DAYS_IN_MONTH_2025 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAYS_IN_MONTH_2026 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ─── Date generator ──────────────────────────────────────────────────────────
// Valid range: 01-Jan-2025 → 27-Apr-2026 (current date)

function generateDate(): string {
  // Pick year: weight slightly towards 2025 (index 0) vs 2026 (index 1)
  const year = seededRandom() < 0.65 ? 2025 : 2026;

  let monthIndex: number;
  if (year === 2026) {
    // Jan (0), Feb (1), Mar (2), Apr (3) with day ≤ 27 for Apr
    monthIndex = randInt(0, 3);
  } else {
    monthIndex = randInt(0, 11);
  }

  const daysInMonth =
    year === 2025
      ? DAYS_IN_MONTH_2025[monthIndex]
      : DAYS_IN_MONTH_2026[monthIndex];

  const maxDay =
    year === 2026 && monthIndex === 3 ? 27 : daysInMonth;

  const day = randInt(1, maxDay);

  const dd = String(day).padStart(2, '0');
  return `${dd}-${MONTHS[monthIndex]}-${year}`;
}

// ─── Generator ───────────────────────────────────────────────────────────────

function generateActivities(): Activity[] {
  const count = randInt(1, 10);
  const activities: Activity[] = [];
  for (let i = 0; i < count; i++) {
    const category = randItem(CATEGORIES);
    activities.push({
      name: randItem(ACTIVITIES_BY_CATEGORY[category]),
      category,
      date: generateDate(),
      recognitionPoints: randInt(1, 100),
    });
  }
  return activities;
}

function generateUsers(): User[] {
  const users: User[] = [];
  // Track used name combos to avoid exact duplicates
  const usedNames = new Set<string>();

  while (users.length < 100) {
    const firstName = randItem(FIRST_NAMES);
    const lastName = randItem(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    if (usedNames.has(fullName)) continue;
    usedNames.add(fullName);

    users.push({
      firstName,
      lastName,
      position: randItem(POSITIONS),
      unit: randItem(UNITS),
      activities: generateActivities(),
    });
  }
  return users;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const mockUsers: User[] = generateUsers();
