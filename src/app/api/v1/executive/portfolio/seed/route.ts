import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkExecutiveAccess } from "@/lib/auth/session";
import { portfolioProjects } from "@/data/portfolio";

export async function POST(req: Request) {
  try {
    const auth = await checkExecutiveAccess();
    if (!auth || auth.userRole !== "FOUNDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const migrated = [];
    
    // Check existing projects
    const existingCount = await db.portfolioProject.count();
    
    for (const p of portfolioProjects) {
      // Check if it exists
      const existing = await db.portfolioProject.findUnique({
        where: { slug: p.slug }
      });
      
      if (!existing) {
        const newProj = await db.portfolioProject.create({
          data: {
            slug: p.slug,
            title: p.title,
            category: p.category,
            industry: p.industry,
            shortDescription: p.shortDescription,
            fullDescription: p.fullDescription,
            problem: p.problem,
            solution: p.solution,
            features: p.features,
            technologies: p.technologies,
            client: p.client,
            liveUrl: p.liveUrl,
            githubUrl: p.githubUrl,
            thumbnail: p.thumbnail,
            heroImage: p.heroImage,
            gallery: p.gallery,
            status: "PUBLISHED",
            featured: p.featured,
            displayOrder: 0,
            seoTitle: p.seoTitle,
            seoDescription: p.seoDescription,
            createdById: auth.userId,
            publishedAt: new Date()
          }
        });
        migrated.push(newProj.slug);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      migratedCount: migrated.length,
      migratedSlugs: migrated,
      totalProjectsInDb: await db.portfolioProject.count()
    });

  } catch (error: any) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
