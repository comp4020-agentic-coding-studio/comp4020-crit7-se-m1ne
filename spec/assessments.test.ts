import { beforeAll, describe, expect, inject, it } from "vitest";

// The core flow the spec asks for: add an assessment, it's persisted to
// SQLite, it shows on the page, and it's still there after a reload. This
// drives the running app over HTTP, the same way spec/guestbook.test.ts did
// for the starter it replaced.
const baseUrl = inject("baseUrl");

describe("assessment planner", () => {
  let title: string;
  let dueDate: string;
  let courseId: string;

  // Astro checks form POSTs carry a same-origin Origin header (CSRF
  // protection); browsers send it automatically, a bare fetch doesn't.
  const post = (path: string, body: URLSearchParams) =>
    fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: { origin: baseUrl },
      body,
      redirect: "manual",
    });

  beforeAll(async () => {
    title = `spec probe ${process.hrtime.bigint()}`;
    dueDate = "2026-11-09";

    // Read a real course id straight off the rendered form rather than
    // assuming a seeded id — the seed list is an implementation detail.
    const page = await fetch(baseUrl);
    const html = await page.text();
    const match = html.match(/<option value="(\d+)"/);
    if (!match) throw new Error("no course option found on the page — is the seed data missing?");
    courseId = match[1];
  });

  it("accepts an assessment and redirects back to the page", async () => {
    const res = await post(
      "/api/assessments",
      new URLSearchParams({ courseId, title, dueDate, weight: "30" }),
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
      new URLSearchParams({ courseId, title: earlier, dueDate: "2026-10-01", weight: "10" }),
    );

    const html = await (await fetch(baseUrl)).text();
    expect(html.indexOf(earlier)).toBeGreaterThan(-1);
    expect(html.indexOf(earlier)).toBeLessThan(html.indexOf(title));
  });
});
