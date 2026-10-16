import { db } from "../src/lib/db";

async function main() {
  console.log("Checking existing login posters in DB...");
  const count = await db.loginPagePoster.count();
  console.log(`Current poster count: ${count}`);

  if (count === 0) {
    console.log("Seeding initial active login posters...");
    await db.loginPagePoster.createMany({
      data: [
        {
          title: "Engineering Tomorrow's Infrastructure",
          subtitle: "Autonomous AI Agents, Next-Gen Cloud, & Enterprise Security",
          imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
          altText: "Global digital infrastructure network visualization",
          ctaLabel: "Explore Solutions",
          ctaUrl: "/services",
          displayOrder: 1,
          status: "ACTIVE",
          internalNotes: "Default flagship banner for Axivon One",
        },
        {
          title: "Applied Artificial Intelligence",
          subtitle: "Transforming Enterprise Operations with Autonomous Intelligence",
          imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
          altText: "Neural network artificial intelligence visualization",
          ctaLabel: "Discover AI",
          ctaUrl: "/services/ai-solutions",
          displayOrder: 2,
          status: "ACTIVE",
          internalNotes: "AI solutions showcase banner",
        },
        {
          title: "Mission-Critical Software Engineering",
          subtitle: "Scalable, resilient architectures engineered for modern business",
          imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
          altText: "Cybersecurity and enterprise systems visualization",
          ctaLabel: "View Portfolio",
          ctaUrl: "/portfolio",
          displayOrder: 3,
          status: "DRAFT",
          internalNotes: "Draft banner for upcoming campaign",
        },
      ],
    });
    console.log("✓ Successfully seeded initial login posters!");
  } else {
    console.log("Posters already exist, skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
