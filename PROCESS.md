# Process overview

Written by you, for a reader: how you got from the brief to the harness and
agentic workflow behind this submission. Markers read this file and follow its
citations; they don't trawl the repo for evidence you didn't point at.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and its
[word counts](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#word-counts)
cover every deliverable.

## What I built

An ANU Assessment Planner: a small Astro + Drizzle + SQLite app where a
student searches the ANU course catalogue (or enters a course manually), adds
an assessment with a title, due date and optional weight, and sees it
persisted and ordered by due date across reloads. `README.md` is the account
of what the app is and what good means here; this is how I got there.

## How I got here

Crit 7 constrained the choice to a real ANU-system slice, wired end-to-end
against a real backend, rather than a purely visual prototype. I picked the
problem myself - ANU assessment information is spread across separate course
pages, and I wanted one place to hold what's actually due - and deliberately
scoped the whole project to one narrow, real flow instead of any part of an
LMS: add an assessment -> persist it in SQLite -> show it in the list -> still
be there after a reload. I kept the starter's Astro + Drizzle + SQLite stack
and its existing form/POST/redirect pattern throughout rather than
introducing a different architecture, and directed the build as a sequence of
small, reviewed, tested, individually-committed changes rather than one pass.
I deliberately kept authentication/accounts, notifications, grade
calculation, collaboration, and automatic Wattle/ANU integration outside this
slice.

**Schema first, deliberately small**
([`e7ec2b2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/commit/e7ec2b2)).
I asked for "only the first logical change: inspect the existing database
structure and implement the minimum schema/migration changes needed for
Course and Assessment... Do not build the UI or assessment creation flow
yet," so two small tables - `courses` (id, code, name) and `assessments` (id,
courseId, title, dueDate, weight) - landed before any interface work, and I
reviewed the migration before it was committed.

**Persistence before polish**
([`c9e0c6c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/commit/c9e0c6c)).
This wired the actual create -> persist -> display -> reload flow against a
small fixed set of demo courses, replacing the starter's guestbook form and
reusing its POST/redirect shape. I verified it manually before committing: a
newly created assessment survived an F5 reload, and one with an earlier due
date correctly sorted ahead of a later one. Only once both checks passed did
I commit "Add persistent assessment creation flow."

**Interface refinement, functionality frozen**
([`ce8f70f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/commit/ce8f70f)).
With the flow working, I asked for the page to read as "a small, polished
student utility rather than a starter/database demo": clear label/input
association, a visual container for the form, spacing and typography, and
removing developer-facing wording like "saved to SQLite" - explicitly without
adding functionality.

**Grounding course data in the real catalogue**
([`2fcadce`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/commit/2fcadce)).
The largest single change: the fixed demo course list was replaced with
course data copied/supplied from the ANU Programs and Courses catalogue and
reduced to the 3,010 course code/title pairs this prototype needs, checked
into `src/data/courses.json` as a static snapshot rather than a live API
integration, live synchronisation, or automated scraping. On top of that
snapshot I built a searchable combobox over it, and a
manual-entry path for courses not listed, backed by a `findOrCreateCourse`
lookup so a course only gets a database row the first time it's picked. I
also made assessment weight optional end-to-end here - nullable in the
schema, persisted as `null` (not a fabricated `0`) when left blank, and
omitted from the card rather than shown as "0%." Manual review caught two
real regressions before this was committed: replacing the native `<select>`
with a text combobox had silently dropped the visual dropdown-arrow
affordance, which I asked to have restored as a clickable, accessible
chevron; and that chevron's empty-query state was showing an arbitrary first
eight of 3,010 courses, which I replaced with a non-selectable "Start typing
to search courses" hint. Both fixes and the optional-weight work landed
together once I'd reviewed the full diff for stray or generated files.

**Deletion and a Today boundary**
([`9aefba2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/commit/9aefba2)).
Added a delete endpoint and a per-card delete control, plus a "Today"
separator splitting the list into past and upcoming assessments using the
server's local calendar date rather than a UTC-shifted one
(`src/lib/date.ts`). Manual review found the text "Delete" button read as if
it were another piece of assessment data next to Due/Weight, so I asked for
it to become a small, accessible trash-icon button that reads as a card
action instead - that correction is part of this commit.

**Desktop layout, in three grounded passes**
([`71f5a5f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/commit/71f5a5f)).
Three rounds reviewed independently in the running dev server before being
committed together: a two-column layout (the assessment list as the wide
primary column, the add-assessment form as a narrower secondary one,
collapsing to a single column on narrow screens, with the delete button
moved to an absolute top-right corner so it stops reading as a third data
column); a widened desktop max-width so the layout doesn't leave unused space
on a wide viewport; and a final pass moving the column split from a
fixed-width sidebar to a proportional ~65/35 ratio so it holds at any
container width.

**Replacing the last starter content**
([`adc7ea4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/commit/adc7ea4)).
Replaced the starter's placeholder README (rendered at `/readme/` as the
app's About page) with a description of the actual planner - what it does
and what it deliberately leaves out - and fixed the one remaining
user-visible "Guestbook" label in that page's navigation to "Planner."

Testing was two-layered throughout:
[`spec/assessments.test.ts`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/blob/main/spec/assessments.test.ts)
grew alongside the feature it covered - create, persist and reload; due-date
ordering; custom courses; optional weight; deletion; the Today separator -
and I ran the relevant typecheck, build and test checks after completed
changes, plus a manual pass in the dev server for visual and interaction
changes before committing. Nothing was committed without reviewing
`git status` and `git diff` first to confirm only the intended files were
staged.

Full range:
[`e7ec2b2...adc7ea4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-se-m1ne/compare/e7ec2b2...adc7ea4)
