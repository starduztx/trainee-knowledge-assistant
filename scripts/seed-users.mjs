import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { hash } from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

const users = [
  { email: 'admin', name: 'Admin' },
  { email: 'admin1', name: 'Admin 1' }
]

const password = await hash('admin123', 10)

try {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password
      },
      create: {
        ...user,
        password
      }
    })
  }

  console.log('Seeded mock users: admin/admin123, admin1/admin123')
} finally {
  await prisma.$disconnect()
}
