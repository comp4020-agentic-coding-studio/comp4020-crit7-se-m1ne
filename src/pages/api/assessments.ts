import type { APIRoute } from "astro";
import { addAssessment } from "../../lib/db";

// The write half of the planner: a plain HTML form POSTs here, the
// assessment goes into SQLite, and the 303 redirect re-renders the page from
// the database — the same shape the starter's guestbook used.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const courseId = Number(form.get("courseId"));
  const title = String(form.get("title") ?? "").trim();
  const dueDate = String(form.get("dueDate") ?? "").trim();
  const weight = Number(form.get("weight"));

  if (Number.isInteger(courseId) && title && dueDate && Number.isFinite(weight)) {
    addAssessment({ courseId, title: title.slice(0, 200), dueDate, weight });
  }
  return redirect("/", 303);
};
