/*
  Warnings:

  - You are about to alter the column `title` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `professor` on the `Syllabi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `uploader` on the `Syllabi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `filename` on the `Syllabi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.

*/
-- DropForeignKey
ALTER TABLE "Syllabi" DROP CONSTRAINT "Syllabi_uploader_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "title" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "Syllabi" ALTER COLUMN "professor" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "uploader" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "filename" SET DATA TYPE VARCHAR(150);

-- AddForeignKey
ALTER TABLE "Syllabi" ADD CONSTRAINT "Syllabi_uploader_fkey" FOREIGN KEY ("uploader") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
