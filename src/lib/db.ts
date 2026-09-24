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

// Courses are no longer pre-seeded: the picker on the form draws from the
// static ANU catalogue (src/data/courses.json), and a course only gets a row
// here the first time someone actually picks it — catalogue or custom.
export function findOrCreateCourse(input: { code: string; name: string }): Course {
  const existing = db.select().from(courses).where(eq(courses.code, input.code)).get();
  if (existing) return existing;
  return db.insert(courses).values(input).returning().get();
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
  weight: number | null;
}): Assessment {
  return db.insert(assessments).values(input).returning().get();
}
