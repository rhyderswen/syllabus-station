import express from "express";
import multer, { memoryStorage } from "multer";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import { prismaGlobal } from "~/sharedDb";
import { S3Global } from "~/sharedS3";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { catalogCodeRegex, CourseData } from "~/types";

let router = express.Router();

const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 10000000 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Invalid file type."));
    }
    cb(null, true);
  },
});

router.get("/get", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized.");

  const syllabusId = req.query.id as string;

  if (!syllabusId) {
    return res.status(400).send("Missing syllabus ID.");
  }

  try {
    const syllabus = await prismaGlobal.syllabi.findUnique({
      where: {
        id: syllabusId,
      },
    });

    if (!syllabus) {
      return res.status(404).send("Syllabus not found.");
    } else {
      const command = new GetObjectCommand({
        Bucket: "syllabus-station",
        Key: `${syllabus.fileID}.pdf`,
      });

      const presigned = await getSignedUrl(S3Global, command, { expiresIn: 3600 });

      res.send({ syllabus: syllabus, url: presigned });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

router.get("/list", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized.");

  const user = await prismaGlobal.user.findUnique({
    where: {
      id: (req.user as any).netId,
    },
  });

  const isAdmin = user?.isAdmin;

  const courseID = req.query.courseID as string;

  if (!courseID) {
    return res.status(400).send("Missing course ID.");
  }

  try {
    const syllabi = await prismaGlobal.syllabi.findMany({
      where: {
        courseID: courseID,
      },
    });

    const courseInfo = await prismaGlobal.course.findUnique({
      where: {
        id: courseID,
      },
    });

    if (!courseInfo) {
      return res.status(404).send("Course not found.");
    }

    let courseData: CourseData = {
      name: courseInfo.title,
      code: courseInfo.catalogCode,
      semesters: [],
    };

    const groupedBySemester = syllabi.reduce(
      (acc, syllabus) => {
        const semester = syllabus.semester;
        if (!acc[semester]) {
          acc[semester] = [];
        }
        acc[semester].push(syllabus);
        return acc;
      },
      {} as { [semester: string]: any[] },
    );

    for (const [semester, syllabi] of Object.entries(groupedBySemester)) {
      for (const syllabus of syllabi) {
        const command = new GetObjectCommand({
          Bucket: "syllabus-station",
          Key: `${syllabus.fileID}.pdf`,
        });

        const presigned = await getSignedUrl(S3Global, command, { expiresIn: 3600 });

        let semesterIndex = courseData.semesters.findIndex((s) => s.semester === semester);
        if (semesterIndex == -1) {
          courseData.semesters.push({
            semester: semester,
            syllabi: [
              {
                filename: `${syllabus.filename}`,
                pdfLink: presigned,
                professor: syllabus.professor,
                uploadDate: syllabus.uploadDate,
                uploader: isAdmin ? syllabus.uploader : "",
              },
            ],
          });
        } else {
          courseData.semesters[semesterIndex].syllabi.push({
            filename: `${syllabus.filename}`,
            pdfLink: presigned,
            professor: syllabus.professor,
            uploadDate: syllabus.uploadDate,
            uploader: isAdmin ? syllabus.uploader : "",
          });
        }
      }
    }

    if (!syllabi) {
      return res.status(404).send("Syllabus not found.");
    } else {
      res.send(courseData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized.");
  if (!req.file) return res.status(400).send("Invalid request.");

  let user = await prismaGlobal.user.findUnique({
    where: {
      id: (req.user as any).netId,
    },
  });
  if (!user || user.isBanned) return res.status(401).send("Unauthorized.");

  // @ts-ignore
  let { professor, semester, courseID, catalogCode, title } = req.body;

  if (!professor || !semester || !courseID || !catalogCode || !title) {
    return res.status(400).send("Invalid request.");
  }

  let course = await prismaGlobal.course.findUnique({
    where: {
      id: courseID,
    },
  });

  if (!course) {
    courseID = randomUUID();

    if (!catalogCodeRegex.test(catalogCode)) {
      return res.status(400).send("Invalid catalog code.");
    }

    await prismaGlobal.course.create({
      data: {
        id: courseID,
        catalogCode: catalogCode,
        title: title,
      },
    });
  }

  let fileID = randomUUID();

  let command = new PutObjectCommand({
    Bucket: "syllabus-station",
    Key: `${fileID}.pdf`,
    Body: req.file.buffer,
  });

  try {
    await S3Global.send(command);

    const created = await prismaGlobal.syllabi.create({
      data: {
        professor: professor,
        semester: semester,
        fileID: fileID,
        uploadDate: new Date(Date.now()),
        course: {
          connect: {
            id: courseID,
          },
        },
        filename: req.file.originalname,
        user: {
          connect: {
            id: (req.user as any).netId,
          },
        },
      },
    });

    res.status(200).send({ id: created.id });
  } catch (error) {
    if (!course) {
      await prismaGlobal.course.delete({
        where: {
          id: courseID,
        },
      });
    }

    console.error(error);
    res.status(500).send("Server error.");
  }
});

router.delete("/delete", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized.");
  let user = await prismaGlobal.user.findUnique({
    where: {
      id: (req.user as any).netId,
    },
  });

  if (!user || !user.isAdmin) return res.status(401).send("Unauthorized.");

  const fileId = req.query.fileId;
  if (!fileId) return res.status(400).send("Invalid request.");

  const request = new DeleteObjectCommand({
    Bucket: "syllabus-station",
    Key: `${fileId}.pdf`,
  });

  try {
    await prismaGlobal.syllabi.delete({
      where: {
        id: fileId,
      },
    });
    await S3Global.send(request);
    res.status(204).send("File deleted.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

export default router;
