# GameJournalCompanion

GameJournalCompanion is a full-stack web application built with Next.js and MongoDB that acts as a personal journal for gamers.

It allows players to register games they’re currently playing and keep structured notes tied to each one — whether that’s tracking side quests, remembering items sold by specific vendors (and their prices), noting useful trades, or marking areas to revisit later when they’ve leveled up.

The goal is to provide a persistent, organized way to capture all those small but important details that are easy to forget during long or complex games.

---

## Features

- User authentication with email verification (Resend)
- Secure login system using NextAuth
- Secure password reset flow with email verification
- Register and manage a personal game library
- Create, edit, and delete notes per game
- Automatic cleanup of related data:
  - De-registering a game removes associated notes
  - Deleting an account removes all user data
- User-submitted game requests via contact form with email notifications
- MongoDB data modeling using referenced relationships between users, games, and notes
- Responsive UI design using Tailwind CSS
- Rate limiting applied to authentication and user-facing API routes

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Frontend:** React
- **Backend:** Next.js API routes / server components
- **Database:** MongoDB
- **Media Storage:** Cloudinary (game cover image hosting and delivery)
- **ODM:** Mongoose
- **Authentication:** NextAuth.js with MongoDB Adapter
- **Email Verification:** Resend
- **Rate Limiting:** Upstash Redis (via @upstash/ratelimit)
- **Styling:** Tailwind CSS
- **Tooling:** ESLint, Turbopack

---

## Notes

Due to a compatibility issue between MongoDB v6 and `@next-auth/mongodb-adapter@1.1.3` (which supports MongoDB Node.js driver v4.x and v5.x), installation currently requires:

```
bash
npm install --legacy-peer-deps
```

Screenshots:

[Starting page while the user isn't logged in](https://res.cloudinary.com/dztftxick/image/upload/v1752070293/GJC_Starting_Page_fbkpaj.png)

[Login page](https://res.cloudinary.com/dztftxick/image/upload/v1776242413/GJC_Login_Page_jmprkc.png)

[Register page](https://res.cloudinary.com/dztftxick/image/upload/v1752070162/GJC_Register_Page_ipcypz.png)

[Home page for admins - includes the 'Add Game To Database' button on the top left](https://res.cloudinary.com/dztftxick/image/upload/v1752070162/GJC_Admin_Home_Page_aomhhf.png)

[Home page for non-admin users - no 'Add Game To Database' button](https://res.cloudinary.com/dztftxick/image/upload/v1752070167/GJC_Non-Admin_Home_Page_yo0zhz.png)

[The modal that opens when a user clicks on the 'Register a new game' card in the home page](https://res.cloudinary.com/dztftxick/image/upload/v1752070156/GJC_Add_Game_Modal_mdptc9.png)

[A game's specific page](https://res.cloudinary.com/dztftxick/image/upload/v1776242412/GJC_Game_Page_d8ueh3.png)

<em>All game cover images are copyright of their respective publishers and used here for non-commercial, educational/demo purposes only.</em>
