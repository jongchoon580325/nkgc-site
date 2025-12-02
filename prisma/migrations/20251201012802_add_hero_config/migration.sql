-- AlterTable
ALTER TABLE "posts" ADD COLUMN "author_name" TEXT;
ALTER TABLE "posts" ADD COLUMN "category" TEXT;

-- CreateTable
CREATE TABLE "board_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "board_type" TEXT NOT NULL,
    "categories" TEXT NOT NULL DEFAULT '[]',
    "settings" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hero_configs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "background_image" TEXT,
    "background_image_mobile" TEXT,
    "animation_type" TEXT NOT NULL DEFAULT 'space',
    "title_text" TEXT,
    "subtitle_text" TEXT,
    "motto1" TEXT,
    "motto2" TEXT,
    "motto3" TEXT,
    "description_text" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "board_settings_board_type_key" ON "board_settings"("board_type");

-- CreateIndex
CREATE INDEX "hero_configs_is_active_idx" ON "hero_configs"("is_active");
