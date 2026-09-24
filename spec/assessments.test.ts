import { beforeAll, describe, expect, inject, it } from "vitest";
import courseCatalogue from "../src/data/courses.json";

// The core flow the spec asks for: add an assessment, it's persisted to
// SQLite, it shows on the page, and it's still there after a reload. This
// drives the running app over HTTP, the same way spec/guestbook.test.ts did
// for the starter it replaced.
const baseUrl = inject("baseUrl");

describe("assessment planner", () => {
  let title: string;
  let dueDate: string;
  // The form submits a course as a code + name pair (picked from the
  // catalogue, or typed manually) rather than a database id — a real
  // catalogue entry exercises the same find-or-create path either way.
  const { code: courseCode, name: courseName } = courseCatalogue[0];

  // Astro checks form POSTs carry a same-origin Origin header (CSRF
  // protection); browsers send it automatically, a bare fetch doesn't.
  const post = (path: string, body: URLSearchParams) =>
    fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: { origin: baseUrl },
      body,
      redirect: "manual",
    });

  beforeAll(() => {
    title = `spec probe ${process.hrtime.bigint()}`;
    dueDate = "2026-11-09";
  });

  it("accepts an assessment and redirects back to the page", async () => {
    const res = await post(
      "/api/assessments",
      new URLSearchParams({ courseCode, courseName, title, dueDate, weight: "30" }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/");
  });

  it("persists the assessment: a fresh page load includes it", async () => {
    const res = await fetch(baseUrl);
    const html = await res.text();
    expect(html).toContain(title);
    expect(html).toContain(dueDate);
  });

  it("orders assessments by due date", async () => {
    const earlier = `spec probe earlier ${process.hrtime.bigint()}`;
    await post(
      "/api/assessments",
      new URLSearchParams({ courseCode, courseName, title: earlier, dueDate: "2026-10-01", weight: "10" }),
    );

    const html = await (await fetch(baseUrl)).text();
    expect(html.indexOf(earlier)).toBeGreaterThan(-1);
    expect(html.indexOf(earlier)).toBeLessThan(html.indexOf(title));
  });

  it("accepts a custom course not in the catalogue", async () => {
    const customTitle = `spec probe custom ${process.hrtime.bigint()}`;
    const res = await post(
      "/api/assessments",
      new URLSearchParams({
        courseCode: "XCUS9999",
        courseName: "A course not in the ANU catalogue",
        title: customTitle,
        dueDate: "2026-12-01",
        weight: "15",
      }),
    );
    expect(res.status).toBe(303);

    const html = await (await fetch(baseUrl)).text();
    expect(html).toContain(customTitle);
    expect(html).toContain("XCUS9999");
  });

  it("accepts an assessment with no weight and persists it without a fabricated value", async () => {
    const noWeightTitle = `spec probe no-weight ${process.hrtime.bigint()}`;
    const noWeightDueDate = "2026-12-15";
    const res = await post(
      "/api/assessments",
      new URLSearchParams({ courseCode, courseName, title: noWeightTitle, dueDate: noWeightDueDate }),
    );
    expect(res.status).toBe(303);

    const html = await (await fetch(baseUrl)).text();
    expect(html).toContain(noWeightTitle);
    expect(html).toContain(noWeightDueDate);

    // This assessment sorts last (latest due date so far), so everything
    // from its title onward belongs to its own card — no weight <dt>/<dd>
    // should have been rendered for it.
    const card = html.slice(html.indexOf(noWeightTitle));
    expect(card).not.toContain("<dt>Weight</dt>");
  });

  it("deletes an assessment and it stays gone after a fresh page load", async () => {
    const deleteTitle = `spec probe delete ${process.hrtime.bigint()}`;
    const createRes = await post(
      "/api/assessments",
      new URLSearchParams({ courseCode, courseName, title: deleteTitle, dueDate: "2026-11-20", weight: "20" }),
    );
    expect(createRes.status).toBe(303);

    const htmlBefore = await (await fetch(baseUrl)).text();
    expect(htmlBefore).toContain(deleteTitle);

    // The delete form's hidden id input sits inside the same <li> as the
    // title, so the first "name=id value=..." after it is this assessment's.
    const afterTitle = htmlBefore.slice(htmlBefore.indexOf(deleteTitle));
    const idMatch = afterTitle.match(/name="id" value="(\d+)"/);
    expect(idMatch).not.toBeNull();

    const deleteRes = await post("/api/assessments/delete", new URLSearchParams({ id: idMatch![1] }));
    expect(deleteRes.status).toBe(303);
    expect(deleteRes.headers.get("location")).toBe("/");

    const htmlAfter = await (await fetch(baseUrl)).text();
    expect(htmlAfter).not.toContain(deleteTitle);
  });

  it("renders a Today separator with past assessments above it and upcoming ones below", async () => {
    const pastTitle = `spec probe past ${process.hrtime.bigint()}`;
    const futureTitle = `spec probe future ${process.hrtime.bigint()}`;

    await post(
      "/api/assessments",
      new URLSearchParams({ courseCode, courseName, title: pastTitle, dueDate: "2000-01-01", weight: "5" }),
    );
    await post(
      "/api/assessments",
      new URLSearchParams({ courseCode, courseName, title: futureTitle, dueDate: "2099-01-01", weight: "5" }),
    );

    const html = await (await fetch(baseUrl)).text();
    const separatorIndex = html.indexOf("Today — ");
    expect(separatorIndex).toBeGreaterThan(-1);
    expect(html.indexOf(pastTitle)).toBeLessThan(separatorIndex);
    expect(html.indexOf(futureTitle)).toBeGreaterThan(separatorIndex);
  });
});
