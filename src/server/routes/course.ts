import express from "express";
import fuzzysort from "fuzzysort";

import { prismaGlobal } from "~/sharedDb";

let router = express.Router();

router.get("/suggest", async (req, res) => {
  const courseSearch = req.query.courseID as string;

  if (!courseSearch) {
    return res.status(400).send("Missing Course ID.");
  }

  try {
    const courses = await prismaGlobal.course.findMany({
      where: {
        OR: [
          {
            catalogCode: {
              contains: courseSearch,
              mode: "insensitive",
            },
          },
          {
            title: {
              contains: courseSearch,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (!courses) {
      return res.status(404).send("No courses found.");
    }

    const sortedCourses = fuzzysort.go(courseSearch, courses, { keys: ["catalogCode", "title"] });

    res.send({ courses: sortedCourses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
});

router.get("/catalogCode", async (req, res) => {
    const courseSearch = req.query.courseID as string;

    if(!courseSearch) {
        return res.status(400).send("Missing Course ID.");
    }

    try{
        const courses = await prismaGlobal.course.findMany({
           where: { catalogCode: courseSearch,},
        });

        if(!courses) {
            return res.status(404).send("No courses found.");
        }

        res.send({courses: courses});
    } catch(error) {
        console.error(error);
        res.status(500).send("Server Error.");
    }
})

export default router;

export default router;
