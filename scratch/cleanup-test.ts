import { db } from "../src/lib/db";

async function cleanup() {
  await db.loginPagePoster.deleteMany({
    where: { title: "Our Fronted Inter" }
  });
  console.log("Cleaned up");
  await db.$disconnect();
}
cleanup();
