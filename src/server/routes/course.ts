import express from "express";
import fuzzysort from "fuzzysort";

import { prismaGlobal } from "~/sharedDb";

let router = express.Router();

router.get("/search", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized.");

  let user = await prismaGlobal.user.findUnique({
    where: {
      id: (req.user as any).netId,
    },
  });
  if (!user || user.isBanned) return res.status(401).send("Unauthorized.");

  const courseSearch = req.query.query as string;

  if (!courseSearch) {
    return res.status(400).send("Missing Course ID.");
  }

  try {
    const courses = await prismaGlobal.course.findMany();

    if (!courses) {
      return res.status(404).send("No courses found.");
    }

    const sortedCourses = fuzzysort
      .go(courseSearch, courses, { keys: ["catalogCode", "title"], threshold: 0, limit: 10 })
      .map((result) => result.obj);

    res.send({ courses: sortedCourses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
});

router.get("/catalogCode", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized.");

  let user = await prismaGlobal.user.findUnique({
    where: {
      id: (req.user as any).netId,
    },
  });
  if (!user || user.isBanned) return res.status(401).send("Unauthorized.");

  const courseSearch = req.query.courseID as string;

  if (!courseSearch) {
    return res.status(400).send("Missing Course ID.");
  }

  try {
    const courses = await prismaGlobal.course.findMany({
      where: { catalogCode: courseSearch },
    });

    if (!courses) {
      return res.status(404).send("No courses found.");
    }

    res.send({ courses: courses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
});

router.get("/listInstructors", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized.");

  let user = await prismaGlobal.user.findUnique({
    where: {
      id: (req.user as any).netId,
    },
  });
  if (!user || user.isBanned) return res.status(401).send("Unauthorized.");

  const course = req.query.catalogCode as string;

  if (!course) {
    return res.status(400).send("Missing Course ID.");
  }

  try {
    const courseID = await prismaGlobal.course.findFirst({
      where: {
        catalogCode: course,
      },

      select: {
        id: true,
      },
    });

    if (!courseID) {
      return res.status(400).send("Course not found.");
    }

    const instructors = await prismaGlobal.syllabi.findMany({
      where: {
        course: courseID,
      },

      distinct: ["professor"],

      select: {
        professor: true,
      },
    });

    if (!instructors) {
      return res.status(400).send("No instructors were found.");
    }

    res.send({ instructors: instructors });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
});

export default router;
