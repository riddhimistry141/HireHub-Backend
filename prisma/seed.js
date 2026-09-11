const prisma = require("../src/config/prisma");
const bcrypt = require("bcrypt");

const roles = [
    { roleName: "ADMIN" },
    { roleName: "RECRUITER" },
    { roleName: "USER" },
];

const experiences = [
    "FRESHER",
    "0-1",
    "1-2",
    "2-3",
    "3-5",
    "5+",
];

const seedRoles = async () => {
    try {
        // -------------------------
        // Seed Roles
        // -------------------------

        for (const role of roles) {
            await prisma.role.upsert({
                where: {
                    roleName: role.roleName,
                },
                update: {},
                create: role,
            });
        }

        console.log("Roles seeded successfully");


        // -------------------------
        // Seed Experiences
        // -------------------------

        for (const experienceName of experiences) {
            await prisma.experience.upsert({
                where: {
                    experienceName,
                },
                update: {},
                create: {
                    experienceName,
                },
            });
        }

        console.log("Experiences seeded successfully");


        // -------------------------
        // Get Admin Role
        // -------------------------

        const adminRole = await prisma.role.findUnique({
            where: {
                roleName: "ADMIN",
            },
        });

        if (!adminRole) {
            throw new Error("ADMIN role not found");
        }


        // -------------------------
        // Admin Details
        // -------------------------

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || "HireHub Admin";

        if (!adminEmail || !adminPassword) {
            throw new Error(
                "ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
            );
        }


        // -------------------------
        // Check Admin Already Exists
        // -------------------------

        const existingAdmin = await prisma.auth.findUnique({
            where: {
                email: adminEmail.toLowerCase(),
            },
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }


        // -------------------------
        // Hash Password
        // -------------------------

        const hashedPassword = await bcrypt.hash(adminPassword, 10);


        // -------------------------
        // Create Admin
        // -------------------------

        await prisma.auth.create({
            data: {
                email: adminEmail.toLowerCase(),
                password: hashedPassword,

                user: {
                    create: {
                        name: adminName,
                        roleId: adminRole.id,
                        status: "ACTIVE",
                    },
                },
            },
        });

        console.log("Admin created successfully");

    } catch (error) {
        console.error("Error seeding:", error);

    } finally {
        await prisma.$disconnect();
    }
};

seedRoles();