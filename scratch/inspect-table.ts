import { db } from "../src/lib/db";

async function inspectTable() {
  try {
    const result = await db.$queryRawUnsafe(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'LoginPagePoster';
    `);
    console.log("LoginPagePoster columns:", JSON.stringify(result, null, 2));

    const fks = await db.$queryRawUnsafe(`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='LoginPagePoster';
    `);
    console.log("Foreign keys:", JSON.stringify(fks, null, 2));

    const count = await db.loginPagePoster.count();
    console.log("Current poster count:", count);
  } catch (err) {
    console.error("Error inspecting table:", err);
  } finally {
    await db.$disconnect();
  }
}

inspectTable();
