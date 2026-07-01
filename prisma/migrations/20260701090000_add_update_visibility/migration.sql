ALTER TABLE "social_posts" ADD COLUMN "is_visible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "news_articles" ADD COLUMN "is_visible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "sightings" ADD COLUMN "is_visible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "social_posts_is_visible_idx" ON "social_posts"("is_visible");
CREATE INDEX "news_articles_is_visible_idx" ON "news_articles"("is_visible");
CREATE INDEX "sightings_is_visible_idx" ON "sightings"("is_visible");
