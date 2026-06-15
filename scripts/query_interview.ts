import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const rawUrl = process.env.DATABASE_URL
if (!rawUrl) throw new Error('No DATABASE_URL')
const connectionString = rawUrl.replace(/^["']|["']$/g, '')
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const interviews = await prisma.interview.findMany({
    include: { tags: true, gallery: true }
  })
  for (const i of interviews) {
    console.log('=== Interview ===')
    console.log('id:', i.id)
    console.log('slug:', i.slug)
    console.log('title:', i.title)
    console.log('summary:', i.summary)
    console.log('source:', i.source)
    console.log('host:', i.host)
    console.log('location:', i.location)
    console.log('duration:', i.duration)
    console.log('date:', i.date)
    console.log('mediaType:', i.mediaType)
    console.log('originalUrl:', i.originalUrl)
    console.log('embedUrl:', i.embedUrl)
    console.log('proofreadStatus:', i.proofreadStatus)
    console.log('tags:', i.tags.map((t: any) => t.name))
    console.log('gallery count:', i.gallery.length)
    console.log('')
    if (i.transcriptCantonese) {
      const tc = i.transcriptCantonese as any
      if (Array.isArray(tc)) {
        console.log('transcriptCantonese: array of', tc.length, 'items')
        tc.slice(0, 8).forEach((item: any, idx: number) => {
          console.log(`  [${idx}]:`, JSON.stringify(item).substring(0, 300))
        })
        console.log('  ... last 3:')
        tc.slice(-3).forEach((item: any, idx: number) => {
          console.log(`  [${tc.length - 3 + idx}]:`, JSON.stringify(item).substring(0, 300))
        })
      } else {
        console.log('transcriptCantonese:', JSON.stringify(tc).substring(0, 1000))
      }
    }
  }
}
main().then(() => prisma.$disconnect())
