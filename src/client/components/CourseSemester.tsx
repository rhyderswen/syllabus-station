import { Box, Collapse, Divider, Group, Paper, Table, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CaretDownIcon } from "@phosphor-icons/react";
import { SemesterData } from "~/types";

type CourseSemesterProps = SemesterData & { openPDFModal: (link: string, title: string) => void };

function CourseSemester({ semester, syllabi, openPDFModal }: CourseSemesterProps) {
  const [expanded, { toggle }] = useDisclosure(true);

  function formatDate(isoDate: string) {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, { dateStyle: "short" });
  }

  return (
    <Paper shadow="xs" id={semester}>
      <Box p="md" onClick={toggle} style={{ cursor: "pointer" }}>
        <Group wrap="nowrap">
          <CaretDownIcon className={"rotatable " + (expanded ? "rotated" : "rotatable")} />
          <Text size="lg" fw="700">
            {semester}
          </Text>
        </Group>
      </Box>
      <Collapse expanded={expanded}>
        <Divider />
        <Table fz="1rem">
          <Table.Tbody>
            {syllabi.map((syllabus, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <UnstyledButton
                    onClick={() => openPDFModal(syllabus.pdfLink, syllabus.filename)}
                    onAuxClick={() => window.open(syllabus.pdfLink, "_blank")}
                    fw={700}
                    className="blue-link"
                  >
                    {syllabus.filename}
                  </UnstyledButton>
                  , taught by {syllabus.professor}
                </Table.Td>
                <Table.Td ta="right" w="fit-content">
                  Uploaded {formatDate(syllabus.uploadDate)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Collapse>
    </Paper>
  );
}

export default CourseSemester;
