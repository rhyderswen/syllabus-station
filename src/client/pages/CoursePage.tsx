import CourseSemester from "@/components/CourseSemester";
import { Container, Stack, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { CourseData } from "~/types";

const CoursePage = () => {
  const [data, setData] = useState<CourseData | null>(null);

  const fetchList = async (courseID: string) => {
    try {
      const response = await fetch(`/syllabus/list?courseID=${courseID}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to fetch syllabus list");
      }

      setData((await response.json()) as CourseData);
    } catch (error) {
      console.error("Error fetching syllabus list:", error);
    }
  };

  useEffect(() => {
    fetchList("f0bd28a7-ffb9-4015-a62f-9523b723e1f5");
  }, []);

  console.log(data);

  return (
    <Container className="course" p="md" w="100%">
      {data && (
        <>
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
        </>
      )}
    </Container>
  );
};

export default CoursePage;
