import type { APIRoute } from "astro";
import { deleteAssessment } from "../../../lib/db";

// Mirrors src/pages/api/assessments.ts: a plain HTML form POSTs here (no JS
// required), we delete the row, and the 303 redirect re-renders the page
// from the database.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = Number(form.get("id"));

  if (Number.isInteger(id)) {
    deleteAssessment(id);
  }
  return redirect("/", 303);
};
