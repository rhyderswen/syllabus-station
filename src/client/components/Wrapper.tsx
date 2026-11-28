import SyllabusStationLogo from "@/assets/SyllabusStation-full-rounded.png";
import SearchBar, { SearchBarHandle } from "@/components/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import { Box, Button, Container, Group, List, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { formatCourseCodeForURL } from "~/textFormatting";
import SyllabusUpload from "./SyllabusUpload";

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { isAuthenticated, isBanned, isAdmin } = useAuth();
  const searchBarRef = useRef<SearchBarHandle>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      searchBarRef.current?.clear();
    }
  }, [location.pathname]);

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
              disabled={isBanned}
              onSubmit={(course) => {
                navigate(`/course/${formatCourseCodeForURL(course.catalogCode)}`);
              }}
              ref={searchBarRef}
            />
            <Button
              fz={14}
              bg="var(--cwrutrueblue)"
              flex="0 0 auto"
              disabled={isBanned}
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
                {isAuthenticated && (
                  <List.Item>
                    <Link to="/logout" target="_parent">
                      Log Out
                    </Link>
                  </List.Item>
                )}
                {isAdmin && <List.Item>Hi Admin!</List.Item>}
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
