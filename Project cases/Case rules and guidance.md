# Case rules and guidance

## Technology

Your track's lessons show the technology and the patterns you build with. Other frameworks or languages are not allowed. Anything outside the lessons needs your teacher's approval first, so that we can still guide and assess what you build.

CSS frameworks such as Tailwind and Bootstrap are not allowed either. We want everyone to get familiar with the basics of CSS first.

## The order of work

No working ahead. The order of topics in this course exists so that you practise every subject and never pick up a habit you have to unlearn later. So:

- Only work with plain HTML and CSS files until we introduce the frontend framework.
- No starting on the backend before the backend lessons start.
- No work on login and authentication before it's mentioned in the lessons.

## Dividing the work

Every case has 4 modules. Divide them so that each student works on one module.

You own your module in every layer: frontend, backend, the entities, the data access, the business logic, the API and the pages. Nobody on the team becomes the 'frontend person' or the 'backend person'.

(A team of 3 drops one module, a team of 5 writes the spec for a new module. See the note at the end.)

## What you build together

Everything that is not module-specific belongs to the whole team. Examples:

- The application shell, the routing, the shared components and styling, the shared types and error handling, the data context and the seed file.
- The member account and the sign-in.
- Things that every module points at (and their pages): the catalogue, the list of machines, the list of beans.

## Independence

The cases are written so that the modules can be built side by side. If a module is unfinished or broken, or a teammate drops out during the semester, the rest of the team can keep building and demonstrating their own work.

Keep your own entities and your own rules inside your own module, or promote them to shared functionality so all modules can use it. Don't reach into another module from inside yours.

## Git

- The team works in one GitHub repository. Create it in the first project session.
- Give your teacher access to it from the start (ask for their GitHub account name).
- Everybody commits with their own account. The history is the evidence of what you contributed.
- Commit while you work, in small pieces, with clear messages that say what you did.
- Most merge headaches start in the shared files. Keep edits to them small, merge them often, and communicate well with your team mates.
- Do not work in a separate branch for weeks. A long-lived branch that touches shared files becomes impossible to merge.

## What the case leaves to you

- The case says what the organisation needs to know. Turning that into a backlog of stories, and deciding what entities, relationships and fields are needed, is your design work.
- Where the case doesn't specify details like a maximum of something, you choose the figure. Write it down in your documentation and keep it in one place in the code.
- It's OK to do more than the case asks, if it fits the domain.
- You are graded mostly on the _quality_ of your work, but there has to be enough of it. Your team will have a whole semester, and the finished application has to look like it. Work that you could have built in a few weeks is not enough.

## Data and fields

We will not focus much on database design in this course, but it's hard to build a good web application on a messy database, and the relationships and the seed data are part of the rubric. Check with your teacher if you need some guidance here. Some tips:

- Anything that appears in a list gets a created-at timestamp. Updated-at is up to you.
- A field with a fixed set of values is an enumeration, not free text.
- If you want to use images for your entities, you can store a web address in a text field. That address can point at a picture somewhere on the web, or at a file you put in the public folder yourself. Make sure pages still look right when the address is empty or dead. Implementing a file upload feature is optional.

## Authentication

Until the authentication lessons near the end of the course, we can use temporary mock user data. The lessons will give you an example. You replace it with real authentication when those lessons arrive, later in the course.

Password hashing, the token, and the login and register screens are built by the whole team together, after the material has been taught. Everything else is then your own work: you protect your own endpoints, enforce ownership in your own business logic, guard your own routes, and handle the signed-in parts of your own pages.

The case names one role above member, such as the desk or a committee. A member in that role is a member like any other, with extra work on top. It's not a second kind of account and it gets no screen of its own. Some rules in the case let that role do something a plain member can't, or do it on a record they don't own. Who holds the role comes from the seed data and the sign-in, and that is team work, like the account itself. The rules that check it are part of your own modules and are your own work, like ownership.

## Seed data

Create good seed data to make sure your implementation can handle realistic data.

- At least twenty to thirty rows for every list. Give them different values in the fields you filter and search on.
- Make the data realistic, and include edge-case rows: a very long title, an empty optional field, a date in the past, a record with nothing attached to it.
- For things that have states, seed them in every state.

## Quality and grading

The course manual gives you a clear description of what good work looks like in this course. Read it, including the rubric, and aim at it from the beginning of the course. Your work is graded as a team, but your individual contribution must be sufficient and affects your final grade.

## Deliverables and presentation

Midterm:

- Delivery of the code and documentation you have so far.
- Presentation to your teachers.
- You get feedback.

End of the semester:

- Delivery of the source code, including the seed data, the configuration and the documentation somebody needs to install and start it.
- A contribution log showing who built what, backed by the git history.
- The final presentation.
- You get your grade.

When presenting, don't just show the happy flow. Show at least one of your own module's rules breaking.

Every module is demonstrated by the student who built it, but you should also be able to answer questions about any part of the application, including the code of the modules you did not build. (So make reviewing each other's code a habit for the whole semester!)

## Teams of 5

If you have a team of five students, you will have to write the specification for another module. Some tips:

- Take something the case leaves out that the organisation would plausibly want. Describe it in one paragraph and have your teacher approve it before you start.
- It stands on its own like the other four.
- Give it the same properties as the other modules: a list worth filtering or searching, a form with validation, a detail page reached through a parameter, and at least one relationship of its own.
- Give it at least one rule about who is allowed to do what, going further than 'only the owner can change it'. Examples: a member with three loans out can't take a fourth, or a member can only score a tasting they had a seat at. A rule that only says 'only the desk may do this' doesn't count.
