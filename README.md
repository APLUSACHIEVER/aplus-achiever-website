# APLUS ACHIEVER — AI Learning Analytics System

This package adds the missing "owner can see student learning" layer to the current
APLUS PSLE AI Vocabulary Tutor.

## Files

- `supabase.sql` — database tables + Row Level Security.
- `supabase-config.js` — project URL + public anon/publishable key.
- `auth.js` — login/signup/session helper.
- `learning-sync.js` — sends learning events to Supabase.
- `student-login.html` — student account page.
- `progress.html` — student's personal progress page.
- `admin.html` — owner/teacher analytics dashboard.
- `VOCABULARY-INTEGRATION.js` — bridge for the existing V17 vocabulary engine.

## 1. Create the database

Create a Supabase project.

Open SQL Editor and run the complete `supabase.sql`.

## 2. Configure the website

Edit `supabase-config.js`:

    window.APLUS_SUPABASE_CONFIG = {
      url: "https://YOUR-PROJECT.supabase.co",
      anonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
    };

Do NOT put a service_role/secret key into GitHub Pages.

## 3. Upload files

Recommended structure:

    /aplus-achiever-website/
      vocabulary.html
      student-login.html
      progress.html
      admin.html
      supabase-config.js
      auth.js
      learning-sync.js
      data/
        vocabulary.js

## 4. Add the three scripts to vocabulary.html

Before the existing vocabulary engine:

    <script src="supabase-config.js"></script>
    <script src="auth.js"></script>
    <script src="learning-sync.js"></script>

Then add the code from `VOCABULARY-INTEGRATION.js` after the existing tutor code.

## 5. Add account navigation

For example:

    <button onclick="location.href='student-login.html'">Student Login</button>
    <button onclick="location.href='progress.html'">View My Progress</button>

## 6. Create the owner account

Use `student-login.html` to create the account.

Then, in Supabase Table Editor -> `profiles`, change that user's `role`
from `student` to `admin`.

For teachers, use `teacher`.

## 7. What the owner can now see

Admin dashboard:

- total students
- active today
- total questions
- overall accuracy
- students needing attention
- student-by-student accuracy
- mastered vocabulary
- weak vocabulary
- response speed
- recent attempts
- CSV export

Student dashboard:

- questions
- accuracy
- mastered words
- review due
- level performance
- words needing attention

## Important

The current V17 engine is still the learning engine. This package does not replace
its localStorage logic; it adds a shared database layer.

For production, the next stage should add:
1. teacher-class assignment,
2. parent read-only reports,
3. automatic weekly reports,
4. daily/weekly trend charts,
5. grammar analytics using the same data model,
6. attendance/course analytics,
7. stronger role-based policies for teachers,
8. data retention/privacy controls,
9. offline queue + retry,
10. server-side aggregation for large student populations.

## V18.1 additions

- `setup.html` — connection/setup diagnostic page.
- Existing localStorage learning data is automatically migrated to Supabase after a student signs in.
- Vocabulary, Progress and Admin pages use the same authentication/database layer.
- Existing 1,000-word vocabulary file is retained.
