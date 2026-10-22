import express from "express";
import multer, {memoryStorage} from "multer";
import {PutObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";

import {prismaGlobal} from "~/sharedDb";
import {S3Global} from "~/sharedS3";
import {randomUUID} from "crypto";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {CourseData} from "~/types";

let router = express.Router();

const upload = multer({
    storage: memoryStorage(),
    limits: {fileSize: 10000000},
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Invalid file type."));
        }
        cb(null, true);
    }
});

router.get("/get", async (req, res) => {
    //if (!req.user)
    //    return res.status(401).send("Unauthorized.");

    const syllabusId = req.query.id as string;

    if (!syllabusId) {
        return res.status(400).send("Missing syllabus ID.");
    }

    try {
        const syllabus = await prismaGlobal.syllabi.findUnique({
            where: {
                id: syllabusId
            }
        });

        if (!syllabus) {
            return res.status(404).send("Syllabus not found.");
        } else {

            const command = new GetObjectCommand({
                Bucket: "syllabus-station",
                Key: `${syllabus.fileID}.pdf`
            });

            const presigned = await getSignedUrl(S3Global, command, {expiresIn: 3600});

            res.send({syllabus: syllabus, url: presigned});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error.");
    }
});

router.get("/list", async (req, res) => {
    if (!req.user)
        return res.status(401).send("Unauthorized.");

    console.log("hi")

    const courseID = req.query.courseID as string;

    if (!courseID) {
        return res.status(400).send("Missing course ID.");
    }

    try {
        const syllabi = await prismaGlobal.syllabi.findMany({
            where: {
                courseID: courseID
            }
        });
        
        const courseInfo = await prismaGlobal.course.findUnique({
            where: {
                id: courseID
            }
        });
        
        if (!courseInfo) {
            return res.status(404).send("Course not found.");
        }
        
        let courseData: CourseData = {
            name: courseInfo.title,
            code: courseInfo.catalogCode,
            semesters: []
        }
        
        
        const groupedBySemester = syllabi.reduce((acc, syllabus) => {
            const semester = syllabus.semester;
            if (!acc[semester]) {
                acc[semester] = [];
            }
            acc[semester].push(syllabus);
            return acc;
        }, {} as {[semester: string]: any[]});

        for (const [semester, syllabi] of Object.entries(groupedBySemester)) {
            for (const syllabus of syllabi) {

                const command = new GetObjectCommand({
                    Bucket: "syllabus-station",
                    Key: `${syllabus.fileID}.pdf`
                });

                const presigned = await getSignedUrl(S3Global, command, {expiresIn: 3600});

                let semesterIndex = courseData.semesters.findIndex(s => s.semester === semester);
                if (semesterIndex == -1) {
                    courseData.semesters.push({
                        semester: semester,
                        syllabi: [{
                            filename: `${syllabus.fileID}`,
                            pdfLink: presigned,
                            professor: syllabus.professor,
                            uploadDate: syllabus.uploadDate
                        }]
                    })
                } else {
                    courseData.semesters[semesterIndex].syllabi.push({
                        filename: `${syllabus.fileID}`,
                        pdfLink: presigned,
                        professor: syllabus.professor,
                        uploadDate: syllabus.uploadDate
                    })
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
    if (!req.user)
        return res.status(401).send("Unauthorized.");

    if (!req.file)
        return res.status(400).send("Invalid request.");

    // @ts-ignore
    const {professor, semester, courseID} = req.body;

    if (!professor || !semester || !courseID) {
        return res.status(400).send("Invalid request.");
    }

    if (!await prismaGlobal.course.findUnique({where: {id: courseID}}))
        return res.status(400).send("Course does not exist.");

    let fileID = randomUUID()

    let command = new PutObjectCommand({
        Bucket: "syllabus-station",
        Key: `${fileID}.pdf`,
        Body: req.file.buffer
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
                        id: courseID
                    }
                },
                user: {
                    connect: {
                        id: (req.user as any).netId
                    }
                },
            }
        })

        res.status(200).send({id: created.id});

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error.");
    }
});

export default router;