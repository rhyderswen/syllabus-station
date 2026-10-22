import {Pool} from "pg";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {

    const hsc = await prisma.user.upsert({
        where: {id: "hsc"},
        update: {},
        create: {
            id: "hsc",
            isAdmin: true,
            isBanned: false,
        }
    })

    const hsc2 = await prisma.user.upsert({
        where: {id: "hsc2"},
        update: {},
        create: {
            id: "hsc2",
            isAdmin: false,
            isBanned: false,
        }
    })

    const introJava = await prisma.course.upsert({
        where: {id: "f0bd28a7-ffb9-4015-a62f-9523b723e1f5"},
        update: {},
        create: {
            id: "f0bd28a7-ffb9-4015-a62f-9523b723e1f5",
            title: "Introduction to Java",
            catalogCode: "CSDS132"
        }
    })

    const haroldFallSyllabus = await prisma.syllabi.upsert({
        where: {id: "945cebfd-bd70-4268-8398-f0a227351de7"},
        update: {},
        create: {
            id: "945cebfd-bd70-4268-8398-f0a227351de7",
            professor: "Harold Connamacher",
            semester: "Fall 2024",
            course: {
                connect: {
                    id: "f0bd28a7-ffb9-4015-a62f-9523b723e1f5"
                }
            },
            fileID: "945cebfd-bd70-4268-8398-f0a227351de7",
            uploadDate: new Date(Date.now()),
            user:{
                connect: {
                    id: "hsc"
                }
            }
        }
    })

    const ozgunerSpringSyllabus = await prisma.syllabi.upsert({
        where: {id: "3057b6bd-8fe8-4939-a429-846caf6cbb22"},
        update: {},
        create: {
            id: "3057b6bd-8fe8-4939-a429-846caf6cbb22",
            professor: "Orhan Ozguner",
            semester: "Spring 2024",
            course: {
                connect: {
                    id: "f0bd28a7-ffb9-4015-a62f-9523b723e1f5"
                }
            },
            fileID: "3057b6bd-8fe8-4939-a429-846caf6cbb22",
            uploadDate: new Date(Date.now()),
            user:{
                connect: {
                    id: "hsc"
                }
            }
        }
    })

}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });