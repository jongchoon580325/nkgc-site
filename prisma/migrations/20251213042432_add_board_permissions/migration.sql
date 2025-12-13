-- AlterTable
ALTER TABLE "users" ADD COLUMN "category" TEXT;
ALTER TABLE "users" ADD COLUMN "rejected_at" DATETIME;

-- CreateTable
CREATE TABLE "board_permissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "board_type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "actions" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "media_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "media_folders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "stored_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "path" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "hash" TEXT,
    "folder_id" TEXT,
    "uploaded_by" INTEGER,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "file_assets_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "media_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "legacy_id" INTEGER,
    "password" TEXT,
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "guest_name" TEXT,
    "extra_data" TEXT,
    "post_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("author_id", "content", "created_at", "id", "post_id", "updated_at") SELECT "author_id", "content", "created_at", "id", "post_id", "updated_at" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE TABLE "new_hero_configs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "background_image" TEXT,
    "background_image_mobile" TEXT,
    "animation_type" TEXT NOT NULL DEFAULT 'static',
    "animation_speed" TEXT NOT NULL DEFAULT 'normal',
    "hide_text" BOOLEAN NOT NULL DEFAULT false,
    "title_text" TEXT,
    "subtitle_text" TEXT,
    "motto1" TEXT,
    "motto2" TEXT,
    "motto3" TEXT,
    "description_text" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_hero_configs" ("animation_type", "background_image", "background_image_mobile", "created_at", "description_text", "id", "is_active", "motto1", "motto2", "motto3", "name", "subtitle_text", "title_text", "updated_at") SELECT "animation_type", "background_image", "background_image_mobile", "created_at", "description_text", "id", "is_active", "motto1", "motto2", "motto3", "name", "subtitle_text", "title_text", "updated_at" FROM "hero_configs";
DROP TABLE "hero_configs";
ALTER TABLE "new_hero_configs" RENAME TO "hero_configs";
CREATE INDEX "hero_configs_is_active_idx" ON "hero_configs"("is_active");
CREATE TABLE "new_posts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "board_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "author_name" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_notice" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "legacy_id" INTEGER,
    "password" TEXT,
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "extra_data" TEXT,
    "legacy_parent_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_posts" ("author_id", "author_name", "board_type", "category", "content", "created_at", "id", "is_notice", "title", "updated_at", "view_count") SELECT "author_id", "author_name", "board_type", "category", "content", "created_at", "id", "is_notice", "title", "updated_at", "view_count" FROM "posts";
DROP TABLE "posts";
ALTER TABLE "new_posts" RENAME TO "posts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "board_permissions_board_type_role_key" ON "board_permissions"("board_type", "role");

-- CreateIndex
CREATE UNIQUE INDEX "media_folders_name_parent_id_key" ON "media_folders"("name", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_stored_name_key" ON "file_assets"("stored_name");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_hash_key" ON "file_assets"("hash");

-- CreateIndex
CREATE INDEX "file_assets_mime_type_idx" ON "file_assets"("mime_type");

-- CreateIndex
CREATE INDEX "file_assets_uploaded_at_idx" ON "file_assets"("uploaded_at");
