-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,
    "isBanned" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "catalogCode" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabi" (
    "id" TEXT NOT NULL,
    "professor" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "courseID" TEXT NOT NULL,
    "fileID" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL,
    "uploader" TEXT NOT NULL,
    "filename" TEXT NOT NULL,

    CONSTRAINT "Syllabi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabi" ADD CONSTRAINT "Syllabi_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabi" ADD CONSTRAINT "Syllabi_uploader_fkey" FOREIGN KEY ("uploader") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
