import { db } from "../src/lib/db";

async function showPosters() {
  try {
    const posters = await db.loginPagePoster.findMany();
    console.log("Posters:", JSON.stringify(posters, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.$disconnect();
  }
}

showPosters();
