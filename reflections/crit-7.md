# Crit 7 Reflection

## What was the breakthrough that moved the work forward?

The breakthrough was reducing the idea to one complete flow before trying to make it feel like a full system. Instead of rebuilding an LMS, I started with one thing I actually wanted from an assessment planner: add an assessment, save it, show it in the list, and make sure it was still there after a reload.

Once that worked end to end, the later decisions became much easier. I could improve course selection, make weight optional, separate past and upcoming work, and add deletion without changing the basic purpose of the prototype. Using the ANU course catalogue also made the course picker feel grounded in the real system rather than being a set of invented examples.

## What did this work change about who you are as a designer/developer?

This work changed how I use an agent during development. I found that a technically working result was not necessarily a finished result. For example, the first course picker worked, but its native dropdown did not fit the rest of the interface. Replacing it introduced other small problems: the dropdown cue disappeared, and an empty search showed arbitrary courses. I only noticed these by running the app and reviewing each change myself.

I became more deliberate about giving the agent one bounded task at a time, checking the result, and correcting specific problems before committing. I also became more willing to keep features out when they were not necessary. The final planner is still a small slice, but each part has a clear reason to be there. For me, the agent became less of a way to generate a whole solution and more of a tool I direct through an iterative design and development process.