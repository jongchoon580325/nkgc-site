-- CreateTable
CREATE TABLE "fee_statuses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inspection" TEXT NOT NULL,
    "church_name" TEXT NOT NULL,
    "pastor_name" TEXT NOT NULL,
    "monthly_fee" INTEGER NOT NULL,
    "annual_fee" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
