-- CreateEnum
CREATE TYPE "ProductionType" AS ENUM ('MOVIE', 'TV_SERIES', 'VARIETY_SHOW');

-- CreateEnum
CREATE TYPE "PerformanceType" AS ENUM ('CONCERT', 'STAGE', 'MUSICAL');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'FILE');

-- CreateEnum
CREATE TYPE "InterviewMediaType" AS ENUM ('VIDEO', 'AUDIO', 'TEXT', 'LIVE');

-- CreateEnum
CREATE TYPE "ImportMethod" AS ENUM ('LINK_PARSE', 'CRAWLER', 'MANUAL');

-- CreateEnum
CREATE TYPE "SubmitType" AS ENUM ('LINK', 'UPLOAD', 'MIXED');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProofreadStatus" AS ENUM ('PENDING', 'PROOFREAD');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('NOTICE', 'RULE', 'UPDATE');

-- CreateEnum
CREATE TYPE "GuestbookTab" AS ENUM ('MESSAGE', 'STORY', 'FEEDBACK');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tag_group" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "filename" TEXT,
    "mime_type" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "alt" TEXT,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_relations" (
    "id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productions" (
    "id" TEXT NOT NULL,
    "type" "ProductionType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "year" INTEGER NOT NULL,
    "role" TEXT,
    "synopsis" TEXT,
    "poster_id" TEXT,
    "watch_links" JSONB,
    "variety_region" TEXT,
    "variety_role" TEXT,
    "language" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performances" (
    "id" TEXT NOT NULL,
    "type" "PerformanceType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "year" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "venue" TEXT,
    "city" TEXT,
    "series" TEXT,
    "poster_id" TEXT,
    "setlist" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_media" (
    "id" TEXT NOT NULL,
    "performance_id" TEXT NOT NULL,
    "title" TEXT,
    "media_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fan_shots" (
    "id" TEXT NOT NULL,
    "performance_id" TEXT NOT NULL,
    "original_url" TEXT,
    "title" TEXT,
    "summary" TEXT,
    "thumbnail_url" TEXT,
    "is_full_copy" BOOLEAN NOT NULL DEFAULT false,
    "author_name" TEXT NOT NULL,
    "contact_info" TEXT,
    "submit_type" "SubmitType" NOT NULL DEFAULT 'LINK',
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fan_shots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endorsements" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "role" TEXT,
    "category" TEXT,
    "description" TEXT,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "media_type" "InterviewMediaType" NOT NULL,
    "original_url" TEXT,
    "original_media_id" TEXT,
    "transcript_cantonese" TEXT,
    "transcript_mandarin" TEXT,
    "proofread_status" "ProofreadStatus" NOT NULL DEFAULT 'PENDING',
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "release_year" INTEGER NOT NULL,
    "language" TEXT,
    "cover_id" TEXT,
    "tracks" JSONB,
    "streaming_links" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magazines" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issue" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "cover_id" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magazines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_posts" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "original_id" TEXT,
    "title" TEXT,
    "summary" TEXT,
    "thumbnail_url" TEXT,
    "published_at" TIMESTAMP(3),
    "content_text" TEXT,
    "is_full_copy" BOOLEAN NOT NULL DEFAULT false,
    "import_method" "ImportMethod" NOT NULL DEFAULT 'MANUAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT,
    "thumbnail_url" TEXT,
    "published_at" TIMESTAMP(3),
    "content_text" TEXT,
    "is_full_copy" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sightings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "original_url" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "thumbnail_url" TEXT,
    "sighted_at" TIMESTAMP(3),
    "content" TEXT,
    "is_full_copy" BOOLEAN NOT NULL DEFAULT false,
    "author_name" TEXT NOT NULL,
    "submit_type" "SubmitType" NOT NULL DEFAULT 'LINK',
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sightings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "related_type" TEXT,
    "related_id" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guestbook" (
    "id" TEXT NOT NULL,
    "tab" "GuestbookTab" NOT NULL,
    "nickname" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "story_tags" TEXT[],
    "related_year" INTEGER,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guestbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "content" VARCHAR(300) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "publish_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductionGallery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductionGallery_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SocialPostMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SocialPostMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SightingMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SightingMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_NewsArticleMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NewsArticleMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductionToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductionToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PerformanceToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PerformanceToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FanShotMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FanShotMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EndorsementMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EndorsementMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EndorsementToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EndorsementToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InterviewToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InterviewToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AlbumToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AlbumToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MagazineScans" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MagazineScans_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MagazineToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MagazineToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SocialPostToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SocialPostToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_NewsArticleToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NewsArticleToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SightingToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SightingToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GuestbookImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GuestbookImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_tag_group_idx" ON "tags"("tag_group");

-- CreateIndex
CREATE INDEX "content_relations_source_type_source_id_idx" ON "content_relations"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "content_relations_target_type_target_id_idx" ON "content_relations"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "content_relations_relation_type_idx" ON "content_relations"("relation_type");

-- CreateIndex
CREATE UNIQUE INDEX "productions_slug_key" ON "productions"("slug");

-- CreateIndex
CREATE INDEX "productions_type_idx" ON "productions"("type");

-- CreateIndex
CREATE INDEX "productions_year_idx" ON "productions"("year");

-- CreateIndex
CREATE UNIQUE INDEX "performances_slug_key" ON "performances"("slug");

-- CreateIndex
CREATE INDEX "performances_type_idx" ON "performances"("type");

-- CreateIndex
CREATE INDEX "performances_start_date_idx" ON "performances"("start_date" DESC);

-- CreateIndex
CREATE INDEX "performance_media_performance_id_idx" ON "performance_media"("performance_id");

-- CreateIndex
CREATE INDEX "fan_shots_performance_id_idx" ON "fan_shots"("performance_id");

-- CreateIndex
CREATE INDEX "fan_shots_status_idx" ON "fan_shots"("status");

-- CreateIndex
CREATE UNIQUE INDEX "endorsements_slug_key" ON "endorsements"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "interviews_slug_key" ON "interviews"("slug");

-- CreateIndex
CREATE INDEX "interviews_date_idx" ON "interviews"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "albums_slug_key" ON "albums"("slug");

-- CreateIndex
CREATE INDEX "albums_release_year_idx" ON "albums"("release_year");

-- CreateIndex
CREATE UNIQUE INDEX "magazines_slug_key" ON "magazines"("slug");

-- CreateIndex
CREATE INDEX "magazines_date_idx" ON "magazines"("date" DESC);

-- CreateIndex
CREATE INDEX "social_posts_platform_idx" ON "social_posts"("platform");

-- CreateIndex
CREATE INDEX "social_posts_published_at_idx" ON "social_posts"("published_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "social_posts_platform_original_id_key" ON "social_posts"("platform", "original_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE INDEX "news_articles_published_at_idx" ON "news_articles"("published_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sightings_slug_key" ON "sightings"("slug");

-- CreateIndex
CREATE INDEX "sightings_status_idx" ON "sightings"("status");

-- CreateIndex
CREATE INDEX "sightings_sighted_at_idx" ON "sightings"("sighted_at" DESC);

-- CreateIndex
CREATE INDEX "timeline_events_date_idx" ON "timeline_events"("date" DESC);

-- CreateIndex
CREATE INDEX "timeline_events_is_visible_idx" ON "timeline_events"("is_visible");

-- CreateIndex
CREATE INDEX "guestbook_tab_idx" ON "guestbook"("tab");

-- CreateIndex
CREATE INDEX "guestbook_status_idx" ON "guestbook"("status");

-- CreateIndex
CREATE INDEX "guestbook_created_at_idx" ON "guestbook"("created_at" DESC);

-- CreateIndex
CREATE INDEX "comments_target_type_target_id_idx" ON "comments"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "announcements_publish_date_idx" ON "announcements"("publish_date" DESC);

-- CreateIndex
CREATE INDEX "announcements_is_pinned_idx" ON "announcements"("is_pinned");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "_ProductionGallery_B_index" ON "_ProductionGallery"("B");

-- CreateIndex
CREATE INDEX "_SocialPostMedia_B_index" ON "_SocialPostMedia"("B");

-- CreateIndex
CREATE INDEX "_SightingMedia_B_index" ON "_SightingMedia"("B");

-- CreateIndex
CREATE INDEX "_NewsArticleMedia_B_index" ON "_NewsArticleMedia"("B");

-- CreateIndex
CREATE INDEX "_ProductionToTag_B_index" ON "_ProductionToTag"("B");

-- CreateIndex
CREATE INDEX "_PerformanceToTag_B_index" ON "_PerformanceToTag"("B");

-- CreateIndex
CREATE INDEX "_FanShotMedia_B_index" ON "_FanShotMedia"("B");

-- CreateIndex
CREATE INDEX "_EndorsementMedia_B_index" ON "_EndorsementMedia"("B");

-- CreateIndex
CREATE INDEX "_EndorsementToTag_B_index" ON "_EndorsementToTag"("B");

-- CreateIndex
CREATE INDEX "_InterviewToTag_B_index" ON "_InterviewToTag"("B");

-- CreateIndex
CREATE INDEX "_AlbumToTag_B_index" ON "_AlbumToTag"("B");

-- CreateIndex
CREATE INDEX "_MagazineScans_B_index" ON "_MagazineScans"("B");

-- CreateIndex
CREATE INDEX "_MagazineToTag_B_index" ON "_MagazineToTag"("B");

-- CreateIndex
CREATE INDEX "_SocialPostToTag_B_index" ON "_SocialPostToTag"("B");

-- CreateIndex
CREATE INDEX "_NewsArticleToTag_B_index" ON "_NewsArticleToTag"("B");

-- CreateIndex
CREATE INDEX "_SightingToTag_B_index" ON "_SightingToTag"("B");

-- CreateIndex
CREATE INDEX "_GuestbookImages_B_index" ON "_GuestbookImages"("B");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performances" ADD CONSTRAINT "performances_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_media" ADD CONSTRAINT "performance_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_media" ADD CONSTRAINT "performance_media_performance_id_fkey" FOREIGN KEY ("performance_id") REFERENCES "performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_shots" ADD CONSTRAINT "fan_shots_performance_id_fkey" FOREIGN KEY ("performance_id") REFERENCES "performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_original_media_id_fkey" FOREIGN KEY ("original_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magazines" ADD CONSTRAINT "magazines_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionGallery" ADD CONSTRAINT "_ProductionGallery_A_fkey" FOREIGN KEY ("A") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionGallery" ADD CONSTRAINT "_ProductionGallery_B_fkey" FOREIGN KEY ("B") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SocialPostMedia" ADD CONSTRAINT "_SocialPostMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SocialPostMedia" ADD CONSTRAINT "_SocialPostMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "social_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SightingMedia" ADD CONSTRAINT "_SightingMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SightingMedia" ADD CONSTRAINT "_SightingMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "sightings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsArticleMedia" ADD CONSTRAINT "_NewsArticleMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsArticleMedia" ADD CONSTRAINT "_NewsArticleMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionToTag" ADD CONSTRAINT "_ProductionToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionToTag" ADD CONSTRAINT "_ProductionToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerformanceToTag" ADD CONSTRAINT "_PerformanceToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerformanceToTag" ADD CONSTRAINT "_PerformanceToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FanShotMedia" ADD CONSTRAINT "_FanShotMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "fan_shots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FanShotMedia" ADD CONSTRAINT "_FanShotMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EndorsementMedia" ADD CONSTRAINT "_EndorsementMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "endorsements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EndorsementMedia" ADD CONSTRAINT "_EndorsementMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EndorsementToTag" ADD CONSTRAINT "_EndorsementToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "endorsements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EndorsementToTag" ADD CONSTRAINT "_EndorsementToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewToTag" ADD CONSTRAINT "_InterviewToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewToTag" ADD CONSTRAINT "_InterviewToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToTag" ADD CONSTRAINT "_AlbumToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToTag" ADD CONSTRAINT "_AlbumToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MagazineScans" ADD CONSTRAINT "_MagazineScans_A_fkey" FOREIGN KEY ("A") REFERENCES "magazines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MagazineScans" ADD CONSTRAINT "_MagazineScans_B_fkey" FOREIGN KEY ("B") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MagazineToTag" ADD CONSTRAINT "_MagazineToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "magazines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MagazineToTag" ADD CONSTRAINT "_MagazineToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SocialPostToTag" ADD CONSTRAINT "_SocialPostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "social_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SocialPostToTag" ADD CONSTRAINT "_SocialPostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsArticleToTag" ADD CONSTRAINT "_NewsArticleToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsArticleToTag" ADD CONSTRAINT "_NewsArticleToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SightingToTag" ADD CONSTRAINT "_SightingToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "sightings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SightingToTag" ADD CONSTRAINT "_SightingToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuestbookImages" ADD CONSTRAINT "_GuestbookImages_A_fkey" FOREIGN KEY ("A") REFERENCES "guestbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuestbookImages" ADD CONSTRAINT "_GuestbookImages_B_fkey" FOREIGN KEY ("B") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
