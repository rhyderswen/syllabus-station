import express from "express";
import multer, {memoryStorage} from "multer";
import {PutObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";

import {prismaGlobal} from "~/sharedDb";
import {S3Global} from "~/sharedS3";
import {randomUUID} from "crypto";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

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
    if (!req.user)
        return res.status(401).send("Unauthorized.");

    try {
        const syllabus = await prismaGlobal.syllabi.findUnique({
            where: {
                id: req.body.syllabus.id
            }
        });

        if (!syllabus) {
            return res.status(404).send("Syllabus not found.");
        } else {

            const command = new GetObjectCommand({
                Bucket: "syllabus-station",
                Key: `${syllabus.id}.pdf`
            });

            const presigned = await getSignedUrl(S3Global, command, {expiresIn: 3600});

            res.send({syllabus: syllabus, url: presigned});
        }
    } catch (error) {
        res.status(500).send("Server error.");
    }
});

router.get("/list", async (req, res) => {
    if (!req.user)
        return res.status(401).send("Unauthorized.");

    try {
        const syllabi = await prismaGlobal.syllabi.groupBy({
            by: ['semester'],
            where: {
                courseID: req.body.syllabus.courseID
            }
        });

        if (!syllabi) {
            return res.status(404).send("Syllabus not found.");
        } else {
            res.send(syllabi);
        }
    } catch (error) {
        res.status(500).send("Server error.");
    }
});

router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.user)
        return res.status(401).send("Unauthorized.");

    if (!req.file)
        return res.status(400).send("Invalid request.");

    // @ts-ignore
    const {professor, semester, courseID} = req.fields.syllabus;

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

        await prismaGlobal.syllabi.create({
            data: {
                professor: professor,
                semester: semester,
                courseID: courseID,
                fileID: fileID,
                uploadDate: new Date(Date.now()),
                uploader: (req.user as any).netID
            }
        })

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error.");
    }
});

export default router;