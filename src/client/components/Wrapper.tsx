import SyllabusStationLogo from "@/assets/SyllabusStation-full.png"; // placeholder to figure out spacing
import { Autocomplete, Box, Button, Container, Group, Modal, List } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { Link } from "react-router";
import SyllabusUpload from "./SyllabusUpload"

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal 
        opened={ opened } 
        onClose={ close } 
        withCloseButton={ true } 
        title="Upload Syllabus" 
        centered      
        size="60vw"
      >
        <SyllabusUpload onClose={close} />
      </Modal>

      <Container
        strategy="grid"
        size={850}
        mih="100dvh"
        style={{ gridTemplateRows: "auto minmax(300px, 1fr) auto" }}
      >
        <Box component="header" data-breakout bg="var(--cwrublue)" p="md">
          <Group data-container c="white" justify="center" display="flex">
            <div className="lineUpLogo" style={{ flexShrink: 0 }}>
              <Link to="/">
                <img src={SyllabusStationLogo} alt="Syllabus Station Logo" height={60} />
              </Link>
            </div>
            <Autocomplete
              flex={1}
              miw={0}
              placeholder="Search for a course..."
              data={[
                "CSDS 132: Introduction to Java",
                "CSDS 233: Data Structures",
                "CSDS 393: Software Engineering",
                "CSDS 395: Senior Project in Computer Science",
              ]}
              //rightSection={loading ? <Loader size={16} /> : null} // This will be used later for a loading circle to appear on the right edge of the search bar while searching
              // TODO: make it so search bar and upload button are only available when logged in
            />
            <Button fz={14} bg="var(--cwrutrueblue)" flex="0 0 auto" onClick = { open }>
              Upload Syllabus
            </Button>
          </Group>
        </Box>

        {children}

        <Box component="footer" data-breakout bg="var(--cwrugray)" p="md">
          <Group data-container justify="center" display="flex">
            <Box flex={1}>
              <List listStyleType="none">
                <List.Item>
                  <Link to="https://github.com/rhyderswen/syllabus-station" target="_blank">
                    Github
                  </Link>
                </List.Item>
                <List.Item>
                  <Link to="/" target="_blank">
                    Another Related link
                  </Link>
                </List.Item>
                <List.Item>
                  <Link to="/" target="_blank">
                    Log Out
                  </Link>
                </List.Item>
                {
                  // TODO: make it so Log Out only appears when logged in
                }
              </List>
            </Box>
            <Box flex={2}>
              <i>*Disclaimer</i>: Syllabi and class content are subject to change at the discretion of
              the instructor. Do not assume information from a syllabus linked here is 100% accurate
              to a course's content.
            </Box>
          </Group>
        </Box>
      </Container>
    </>
  );
};

export default Wrapper;
