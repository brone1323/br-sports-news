import { NextRequest, NextResponse } from 'next/server'
import { readFile, access } from 'fs/promises'
import path from 'path'
import facebookPages from '@/data/facebook-pages.json'

type PageEntry = { slug: string; pageId: string; pageAccessToken: string }

const GRAPH = 'https://graph.facebook.com/v19.0'

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function uploadProfilePicture(
  pageId: string,
  token: string,
  imagePath: string
): Promise<{ success: boolean; error?: unknown }> {
  if (!(await fileExists(imagePath))) {
    return { success: false, error: 'profile.png not found' }
  }

  const buf = await readFile(imagePath)
  const form = new FormData()
  form.append('source', new Blob([buf], { type: 'image/png' }), 'profile.png')
  form.append('access_token', token)

  const res = await fetch(`${GRAPH}/${pageId}/picture`, { method: 'POST', body: form })
  if (!res.ok) return { success: false, error: await res.json() }
  return { success: true }
}

async function uploadCoverPhoto(
  pageId: string,
  token: string,
  imagePath: string
): Promise<{ success: boolean; photoId?: string; error?: unknown }> {
  if (!(await fileExists(imagePath))) {
    return { success: false, error: 'cover.png not found' }
  }

  const buf = await readFile(imagePath)

  // Step 1: upload as unpublished photo to get a photo ID
  const form = new FormData()
  form.append('source', new Blob([buf], { type: 'image/png' }), 'cover.png')
  form.append('access_token', token)
  form.append('published', 'false')

  const uploadRes = await fetch(`${GRAPH}/${pageId}/photos`, { method: 'POST', body: form })
  if (!uploadRes.ok) return { success: false, error: await uploadRes.json() }
  const { id: photoId } = await uploadRes.json()

  // Step 2: set the uploaded photo as the page cover
  const coverRes = await fetch(`${GRAPH}/${pageId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cover: { id: photoId }, access_token: token }),
  })
  if (!coverRes.ok) return { success: false, error: await coverRes.json() }
  return { success: true, photoId }
}

/** GET — list all active pages that will be targeted */
export async function GET() {
  const active = (facebookPages as PageEntry[]).filter((p) => p.pageId && p.pageAccessToken)
  return NextResponse.json({ count: active.length, slugs: active.map((p) => p.slug) })
}

/**
 * POST — upload profile picture and cover photo to all active Facebook pages.
 * Optionally pass { slug } in the body to target a single page.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { slug: filterSlug } = body as { slug?: string }

  const active = (facebookPages as PageEntry[]).filter((p) => p.pageId && p.pageAccessToken)
  const pages = filterSlug ? active.filter((p) => p.slug === filterSlug) : active

  if (filterSlug && pages.length === 0) {
    return NextResponse.json(
      { error: `No active page found for slug: ${filterSlug}` },
      { status: 404 }
    )
  }

  const results = await Promise.all(
    pages.map(async (page) => {
      const assetsDir = path.join(process.cwd(), 'public', 'facebook-assets', page.slug)

      const [profile, cover] = await Promise.all([
        uploadProfilePicture(
          page.pageId,
          page.pageAccessToken,
          path.join(assetsDir, 'profile.png')
        ),
        uploadCoverPhoto(
          page.pageId,
          page.pageAccessToken,
          path.join(assetsDir, 'cover.png')
        ),
      ])

      return { slug: page.slug, pageId: page.pageId, profile, cover }
    })
  )

  const allOk = results.every((r) => r.profile.success && r.cover.success)
  return NextResponse.json({ results, allOk }, { status: allOk ? 200 : 207 })
}
