import express from "express";
import fuzzysort from "fuzzysort";

import {prismaGlobal} from "~/sharedDb";

let router = express.Router();

router.get("/courselist", async (req, res) => {
    const courseIDSearch = req.query.courseID as string;

    if(!courseIDSearch) {
        return res.status(400).send("Missing Course ID.");
    }

    try{
        const courses = await prismaGlobal.course.findMany({
            where: {
                catalogCode: {
                    contains: courseIDSearch,
                    mode: "insensitive"
                },
            },
        });

        if(!courses) {
            return res.status(404).send("No courses found.");
        }

        const sortedCourses = fuzzysort.go(courseIDSearch, courses, {key: "catalogCode"});

        res.send({courses: sortedCourses});
    }

    catch(error) {
        console.error(error);
        res.status(500).send("Server Error.");
    }
});