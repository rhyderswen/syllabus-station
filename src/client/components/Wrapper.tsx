import SyllabusStationLogo from "@/assets/SyllabusStation-full-rounded.png";
import { Box, Button, Container, Group, Modal, List } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useNavigate } from "react-router";
import SyllabusUpload from "./SyllabusUpload";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import { formatCourseCodeForURL } from "~/textFormatting";

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { isAuthenticated, status } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={true}
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
            <SearchBar
              placeholder="Search for a course..."
              onSubmit={(course) => {
                navigate(`/course/${formatCourseCodeForURL(course.catalogCode)}`);
              }}
              isAuthenticated={isAuthenticated}
            />
            <Button
              fz={14}
              bg="var(--cwrutrueblue)"
              flex="0 0 auto"
              onClick={() => {
                if (isAuthenticated) {
                  open();
                } else {
                  window.open("/login", "_parent");
                }
              }}
            >
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
                {isAuthenticated ? (
                  <List.Item>
                    <Link to="/logout" target="_parent">
                      Log Out
                    </Link>
                  </List.Item>
                ) : (
                  <></>
                )}
              </List>
            </Box>
            <Box flex={2}>
              <i>*Disclaimer</i>: Syllabi and class content are subject to change at the discretion
              of the instructor. Do not assume information from a syllabus linked here is 100%
              accurate to a course's content.
            </Box>
          </Group>
        </Box>
      </Container>
    </>
  );
};

export default Wrapper;
