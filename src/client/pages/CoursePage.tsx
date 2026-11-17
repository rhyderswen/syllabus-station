import CourseSemester from "@/components/CourseSemester";
import PDFViewer from "@/components/PDFViewer";
import { authFetch } from "@/util/api";
import { Container, Modal, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CourseData } from "~/types";
import { formatCourseCode } from "../util/textFormatting";

const TEMP_COURSE_ID = "f0bd28a7-ffb9-4015-a62f-9523b723e1f5";

const CoursePage = () => {
  const [currentPDFLink, setCurrentPDFLink] = useState("");
  const [currentPDFTitle, setCurrentPDFTitle] = useState("");
  const [pdfOpened, { open, close }] = useDisclosure(false);

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

  function openPDFModal(link: string, title: string) {
    setCurrentPDFLink(link);
    setCurrentPDFTitle(title);
    open();
  }

  return (
    <Container className="course" p="md" w="100%">
      <Modal
        opened={pdfOpened}
        onClose={close}
        title={currentPDFTitle}
        size="auto"
        centered
        overlayProps={{
          color: "#000",
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: { backgroundColor: "var(--cwrugray)" },
          header: { backgroundColor: "var(--cwrugray)" },
        }}
      >
        <PDFViewer url={currentPDFLink} />
      </Modal>
      {!isLoading && !isError && data && (
        <>
          <Title order={1} mt="md" mb="xl" ta="center">
            <b style={{ color: "var(--cwrublue)" }}>{formatCourseCode(data.code)}</b>: {data.name}
          </Title>
          <Stack w="100%" gap="xs">
            {data.semesters.map((semester) => (
              <CourseSemester
                key={semester.semester}
                semester={semester.semester}
                syllabi={semester.syllabi}
                openPDFModal={openPDFModal}
              />
            ))}
          </Stack>
        </>
      )}
    </Container>
  );
};

export default CoursePage;
