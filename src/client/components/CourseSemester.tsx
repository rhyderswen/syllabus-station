import { Box, Collapse, Divider, Group, Paper, Table, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CaretDownIcon } from "@phosphor-icons/react";
import { SemesterData } from "~/types";

function CourseSemester({ semester, syllabi }: SemesterData) {
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
                  <a href={syllabus.pdfLink} target="_blank" rel="noopener noreferrer">
                    {syllabus.filename}
                  </a>
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
