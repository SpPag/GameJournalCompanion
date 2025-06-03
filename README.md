# GameJournalCompanion
Small ongoing project, meant to function as a digital journal for video game players. The initial idea is to allow players to write down side quest stuff, items they found specific vendors selling along with their listed prices, available trades, places left for later exploration when they've leveled up a bit more, etc.

Since I'm using MongoDB v6 with @next-auth/mongodb-adapter@1.1.3 (which only supports MongoDB Node.js driver versions 4.x or 5.x) there's a conflict. For now, I'm working around it by running npm install with a tag: "npm install --legacy-peer-deps"

<details>
  <summary><em>built using</em></summary>
  <ul>
    <li>Next.js as the overarching React framework</li>
    <li>JavaScript / TypeScript for the backend logic </li>
    <li>React as the frontend framework</li>
    <li>Tailwind for styling</li>
    <li>ESLint to enforce certain approaches and styles both for performance and consistency, as well as help catch bugs early</li>
    <li>AppRouter to handle routing and page navigation. It also makes it easier to mix server and client components</li>
    <li>Turbopack as the bundler that is build by Vercel, the creators of NextJS to eventually replace the currently most widely used bundler, Webpack</li>
    <li>Mongoose for handling the connection to MongoDB</li>
  </ul>
</details>





<em>All game cover images are copyright of their respective publishers and used here for non-commercial, educational/demo purposes only.</em>
