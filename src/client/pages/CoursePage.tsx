import CourseSemester from "@/components/CourseSemester";
import { authFetch } from "@/util/api";
import { Container, Stack, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { CourseData } from "~/types";

const TEMP_COURSE_ID = "f0bd28a7-ffb9-4015-a62f-9523b723e1f5";

const CoursePage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["course", TEMP_COURSE_ID],
    queryFn: async () => {
      const res = await authFetch(`/syllabus/list?courseID=${encodeURIComponent(TEMP_COURSE_ID)}`, {
        method: "GET",
      });
      return (await res.json()) as CourseData;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return (
    <Container className="course" p="md" w="100%">
      {!isLoading && !isError && data && (
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
