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
  const interview = await prisma.interview.findFirst({
    include: { tags: true, gallery: true, originalMedia: true }
  })
  if (!interview) return
  
  // Print full transcript to analyze content
  const tc = interview.transcriptCantonese as any
  if (tc && tc.segments) {
    console.log('=== Full Transcript ===')
    console.log('Total segments:', tc.segments.length)
    // Print all segments
    for (const seg of tc.segments) {
      console.log(`[${seg.timestamp}] ${seg.speakerLabel}: ${seg.text}`)
    }
  }
  
  console.log('\n=== Gallery ===')
  interview.gallery.forEach((m: any) => {
    console.log('  media:', m.id, m.url, m.type)
  })
  
  console.log('\n=== Original Media ===')
  if (interview.originalMedia) {
    console.log('  id:', interview.originalMedia.id)
    console.log('  url:', interview.originalMedia.url)
    console.log('  type:', interview.originalMedia.type)
  }
}
main().then(() => prisma.$disconnect())
