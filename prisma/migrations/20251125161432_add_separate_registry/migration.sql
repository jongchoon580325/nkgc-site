-- CreateTable
CREATE TABLE "separate_registries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "birth_date" TEXT NOT NULL,
    "registration_date" TEXT NOT NULL,
    "registration_reason" TEXT NOT NULL,
    "cancellation_date" TEXT NOT NULL,
    "cancellation_reason" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
