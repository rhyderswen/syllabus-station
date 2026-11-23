import CourseSemester from "@/components/CourseSemester";
import PDFViewer from "@/components/PDFViewer";
import { courseQuery } from "@/util/api";
import { Container, Modal, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatCourseCode, parseCourseCodeFromURL } from "~/textFormatting";
import { useParams } from "react-router";

const CoursePage = () => {
  const [currentPDFLink, setCurrentPDFLink] = useState("");
  const [currentPDFTitle, setCurrentPDFTitle] = useState("");
  const [pdfOpened, { open, close }] = useDisclosure(false);
  const { courseCode } = useParams<{ courseCode: string }>();
  const requestCourseCode = parseCourseCodeFromURL(courseCode!);

  const { data, isLoading, isError } = useQuery({
    ...courseQuery(requestCourseCode!),
    enabled: !!requestCourseCode,
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
      {!isLoading && isError && (
        <Title order={3} ta="center" mb="xl">
          Unable to load this course. Please try again later.
        </Title>
      )}

      {!isLoading && !isError && data === null && (
        <>
          <Title order={2} ta="center" mb="xl">
            Error 404 <br />
          </Title>
          <Title order={3} ta="center" mt="xl">
            No course with catalog code '{requestCourseCode}' has been recorded. <br />
            Please check the URL to make sure you entered the correct value, or use the search bar
            to find the course you're looking for.
          </Title>
        </>
      )}

      {!isLoading && !isError && data && (
        <>
          <Title order={1} mt="md" mb="xl" ta="center">
            <b style={{ color: "var(--cwrublue)" }}>{formatCourseCode(data.code)}</b>: {data.name}
          </Title>
          <Stack w="100%" gap="xs">
            {data.semesters.length === 0 ||
            data.semesters.every((semester) => semester.syllabi.length === 0) ? (
              <Title order={3} ta="center">
                No syllabi have been uploaded for this course yet.
              </Title>
            ) : (
              data.semesters.map((semester) => (
                <CourseSemester
                  key={semester.semester}
                  semester={semester.semester}
                  syllabi={semester.syllabi}
                  openPDFModal={openPDFModal}
                />
              ))
            )}
          </Stack>
        </>
      )}
    </Container>
  );
};

export default CoursePage;
