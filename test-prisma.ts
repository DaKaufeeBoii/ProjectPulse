import { prisma } from './lib/prisma';
async function run() {
    try {
        console.log("Testing DB connection...");
        const users = await prisma.user.findMany();
        console.log("Success! Users count:", users.length);
    } catch (err) {
        console.error("DB Error:", err);
    }
}
run();
