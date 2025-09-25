const { drizzle, eq } = require("drizzle-orm");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { users, userStatusEnum, profileRoleEnum } = require("./schema");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function seedAdmin() {
  try {
    const adminEmail = "admin@example.com";
    const adminUsername = "admin";
    const plainPassword = "Admin@123";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Correct usage of eq
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existing.length > 0) {
      console.log("✅ Admin already exists:", existing[0]);
      return;
    }

    const inserted = await db
      .insert(users)
      .values({
        email: adminEmail,
        username: adminUsername,
        displayName: "Super Admin",
        status: "ACTIVE" as (typeof userStatusEnum.enumValues)[number],
        role: "ADMIN" as (typeof profileRoleEnum.enumValues)[number],
        personaTags: [],
        positionNumber: 1001,
        passwordHash,
        provider: "LOCAL",
      })
      .returning();

    console.log("🎉 Admin created with email:", adminEmail);
    console.log("   Temporary password:", plainPassword);
    console.log("   Record:", inserted[0]);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
