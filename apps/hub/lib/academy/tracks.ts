/**
 * Track registry for Nifty Haven (/learn).
 *
 * Two tracks, one shell. Add a track by adding a content file and listing it
 * here — the /learn routes are generated from TRACKS, so nothing else needs
 * touching.
 */
import type { Track, TrackSlug, Lesson } from './types'
import { REAL_ESTATE } from './content/real-estate'
import { FOUNDERS } from './content/founders'

export const TRACKS: readonly Track[] = [REAL_ESTATE, FOUNDERS]

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug)
}

export function getLesson(trackSlug: string, lessonSlug: string): { track: Track; lesson: Lesson } | undefined {
  const track = getTrack(trackSlug)
  if (!track) return undefined
  const lesson = track.lessons.find((l) => l.slug === lessonSlug)
  if (!lesson) return undefined
  return { track, lesson }
}

/** Every (track, lesson) pair — used by generateStaticParams and the sitemap. */
export function allLessonParams(): { track: TrackSlug; lesson: string }[] {
  return TRACKS.flatMap((t) => t.lessons.map((l) => ({ track: t.slug, lesson: l.slug })))
}

/** Free lessons are the demand test: readable without an email, and the only ones indexed. */
export function freeLessons(track: Track): readonly Lesson[] {
  return track.lessons.filter((l) => l.free)
}
