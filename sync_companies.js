const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sync() {
    try {
        console.log('Syncing existing company assignments...');

        // 1. Get all users with a companyId
        const client = await pool.connect();
        const users = await client.query('SELECT id, "companyId" FROM "User" WHERE "companyId" IS NOT NULL');

        console.log(`Found ${users.rows.length} users with primary companyId.`);

        for (const user of users.rows) {
            // Insert into the many-to-many join table
            // Prisma 7 creates join tables with names like _UserCompanies
            // We need to find the actual table name. Usually it's _UserCompanies
            const tableName = '_UserCompanies';

            // Check if already exists
            const exists = await client.query(`SELECT 1 FROM "${tableName}" WHERE "A" = $1 AND "B" = $2`, [user.companyId, user.id]);

            if (exists.rows.length === 0) {
                await client.query(`INSERT INTO "${tableName}" ("A", "B") VALUES ($1, $2)`, [user.companyId, user.id]);
                console.log(`Assigned User ${user.id} to Company ${user.companyId} in many-to-many table.`);
            }
        }

        client.release();
        console.log('Sync complete!');
    } catch (err) {
        console.error('Sync failed:', err.message);
    } finally {
        await pool.end();
    }
}

sync();
