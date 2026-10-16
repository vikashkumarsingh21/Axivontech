import { db } from "../src/lib/db";

async function testCreate() {
  try {
    console.log("Checking database connection and User...");
    const user = await db.user.findFirst();
    console.log("Found user:", user?.id, user?.email);

    console.log("Attempting db.loginPagePoster.create...");
    const poster = await db.loginPagePoster.create({
      data: {
        title: "Our Fronted Inter",
        subtitle: null,
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjWFJxur5FAz8H7mwa7vTF",
        altText: null,
        ctaLabel: null,
        ctaUrl: null,
        displayOrder: 0,
        status: "DRAFT",
        startsAt: null,
        endsAt: null,
        internalNotes: null,
        createdById: user ? user.id : null,
      },
    });
    console.log("Success! Created poster:", poster.id, poster.title);
    
    // Clean up
    await db.loginPagePoster.delete({ where: { id: poster.id } });
    console.log("Cleaned up successfully.");
  } catch (err) {
    console.error("FAILED to create poster:", err);
  } finally {
    await db.$disconnect();
  }
}

testCreate();
