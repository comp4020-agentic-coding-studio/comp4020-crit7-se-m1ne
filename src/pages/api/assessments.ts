import type { APIRoute } from "astro";
import { addAssessment, findOrCreateCourse } from "../../lib/db";

// The write half of the planner: a plain HTML form POSTs here, the
// assessment goes into SQLite, and the 303 redirect re-renders the page from
// the database — the same shape the starter's guestbook used.
//
// The form sends the course as a code + name pair rather than an id — it's
// picked from the static catalogue or typed as a custom entry, and either
// way there may not be a row for it yet, so we find-or-create one here.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const courseCode = String(form.get("courseCode") ?? "").trim();
  const courseName = String(form.get("courseName") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const dueDate = String(form.get("dueDate") ?? "").trim();
  const weightRaw = String(form.get("weight") ?? "").trim();
  const weight = weightRaw === "" ? null : Number(weightRaw);

  if (courseCode && courseName && title && dueDate && (weight === null || Number.isFinite(weight))) {
    const course = findOrCreateCourse({
      code: courseCode.slice(0, 50),
      name: courseName.slice(0, 200),
    });
    addAssessment({ courseId: course.id, title: title.slice(0, 200), dueDate, weight });
  }
  return redirect("/", 303);
};
