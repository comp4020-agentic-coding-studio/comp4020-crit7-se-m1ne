import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type Assessment, type Course, assessments, courses } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

export type { Assessment, Course };

// A fixed set of courses so the planner has something to demonstrate against
// without needing accounts or an ANU API integration. Seeded once, on first
// boot of a fresh database; every later boot sees the table already has rows.
const DEMO_COURSES: Array<Pick<Course, "code" | "name">> = [
  { code: "COMP4020", name: "Agentic Coding Studio" },
  { code: "COMP3900", name: "Computer Science Project" },
  { code: "COMP2100", name: "Software Design Methodologies" },
  { code: "MATH2405", name: "Introduction to Statistical Machine Learning" },
];

if (db.select().from(courses).all().length === 0) {
  db.insert(courses).values(DEMO_COURSES).run();
}

export function listCourses(): Course[] {
  return db.select().from(courses).orderBy(asc(courses.code)).all();
}

export type AssessmentWithCourse = Assessment & { courseCode: string; courseName: string };

export function listAssessments(): AssessmentWithCourse[] {
  return db
    .select({
      id: assessments.id,
      courseId: assessments.courseId,
      title: assessments.title,
      dueDate: assessments.dueDate,
      weight: assessments.weight,
      courseCode: courses.code,
      courseName: courses.name,
    })
    .from(assessments)
    .innerJoin(courses, eq(assessments.courseId, courses.id))
    .orderBy(asc(assessments.dueDate))
    .all();
}

export function addAssessment(input: {
  courseId: number;
  title: string;
  dueDate: string;
  weight: number;
}): Assessment {
  return db.insert(assessments).values(input).returning().get();
}
