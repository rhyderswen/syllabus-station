import CourseSemester from "@/components/CourseSemester";
import { Container, Stack, Title } from "@mantine/core";
import { CourseData } from "~/types";

const SampleData: CourseData = {
  name: "Introduction to Java",
  code: "CSDS 132",
  semesters: [
    {
      semester: "Fall 2026",
      syllabi: [
        {
          filename: "syllabus.pdf",
          pdfLink: "https://example.com/syllabus.pdf",
          professor: "Harold Connamacher",
          uploadDate: "10/12/26",
        },
        {
          filename: "syll.pdf",
          professor: "Harold Connamacher",
          uploadDate: "9/1/26",
          pdfLink: "https://example.com/syllabus.pdf",
        },
      ],
    },
    {
      semester: "Spring 2026",
      syllabi: [
        {
          filename: "csds132_syllabus.pdf",
          professor: "Orhan Ozguner",
          uploadDate: "4/12/26",
          pdfLink: "https://example.com/syllabus.pdf",
        },
      ],
    },
  ],
};

const data = SampleData;

const CoursePage = () => {
  return (
    <Container className="course" p="md" w="100%">
      <Title order={1} mt="md" mb="xl" ta="center">
        <b style={{ color: "var(--cwrublue)" }}>{data.code}</b>: {data.name}
      </Title>
      <Stack w="100%" gap="xs">
        {data.semesters.map((semester) => (
          <CourseSemester
            key={semester.semester}
            semester={semester.semester}
            syllabi={semester.syllabi}
          />
        ))}
      </Stack>
    </Container>
  );
};

export default CoursePage;
