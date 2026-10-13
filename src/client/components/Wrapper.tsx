import lineupLogo from "@/assets/lineup-full.png"; // placeholder to figure out spacing
import { Autocomplete, Box, Button, Container, Group } from "@mantine/core";
import { Link } from "react-router";

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
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
              <img src={lineupLogo} alt="LineUp Logo" height={50} />
            </Link>
          </div>
          <Autocomplete
            style={{ flex: 1, minWidth: 0 }}
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
          <Button style={{ flexShrink: 0, fontSize: 14, background: "#007ab8" }}>
            Upload Syllabus
          </Button>
        </Group>
      </Box>

      {children}

      <Box component="footer" data-breakout bg="var(--cwrugray)" p="md">
        <Group data-container justify="center" display="flex">
          <div style={{ flex: 1 }}>
            <ul style={{ listStyleType: "none" }}>
              <li>
                <a href="https://github.com/rhyderswen/syllabus-station" target="_blank">
                  Github
                </a>
              </li>
              <li>
                <a href="/" target="_blank">
                  Another Related link
                </a>
              </li>
              <li>
                <a href="/" target="_blank">
                  Log Out
                </a>
              </li>
              {
                // TODO: make it so Log Out only appears when logged in
              }
            </ul>
          </div>
          <div style={{ flex: 2 }}>
            <i>*Disclaimer</i>: Syllabi and class content are subject to change at the discretion of
            the instructor. Do not assume information from a syllabus linked here is 100% accurate
            to a course's content.
          </div>
        </Group>
      </Box>
    </Container>
  );
};

export default Wrapper;
