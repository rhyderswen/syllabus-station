import express from "express";

import {prismaGlobal} from "~/sharedDb";

let router = express.Router();

router.get("/syllabus/get", async(req, res) => {
    try{
        const syllabus = await prismaGlobal.syllabi.findUnique({
            where: {
                id: req.syllabi.id
            }
        });

        if(!syllabus) {
            return res.status(404).send("Syllabus not found.");
        }

        else {
            res.send(syllabus);
        }
    }

    catch(error) {
        res.status(500).send("Server error.");
    }
});

router.get("/syllabus/list", async(req, res) => {
    try{
        const syllabi = await prismaGlobal.syllabi.groupBy({
            by: ['semester'],
            where: {
                courseId: req.syllabi.courseID
            }
        });

        if(!syllabi) {
            return res.status(404).send("Syllabus not found.");
        }

        else {
            res.send(syllabi);
        }
    }

    catch(error) {
        res.status(500).send("Server error.");
    }
});

router.post("/syllabus/upload", async(req, res) => {
    try{
        if(!await prismaGlobal.syllabi.findUnique({where: {id: req.syllabi.id}})) {
            await prismaGlobal.syllabi.create({
                data: {
                    professor: req.syllabi.professor,
                    semester: req.syllabi.semester,
                    courseID: req.syllabi.courseID, //This might need to be changed; we'll need some way to get the courseID to match the course name that already exists in the table
                    fileID: req.syllabi.fileID,
                    uploadDate: new Date(Date.now()),
                    uploader: req.user.netId
                }
            })
        }
    }

    catch(error) {
        res.status(500).send("Server error.");
    }
});