import { Container, Title } from "@mantine/core";

const LoggedInHome = () => {
  return (
    <Container className="home" p="xl" ta="center">
      <Title order={1} mb="md">
        Welcome to <b style={{ color: "var(--cwrublue)" }}>Syllabus Station</b>!
      </Title>
      {
        // not too attached to CWRU blue for the name here ^
        // but until we have a proper logo/color scheme figured out, it's fine
      }
      Use the search bar above to find the syllabi of any course offered at CWRU.
      <br></br>
      Or, if you notice that a syllabus is missing, you can press the button in the top right to
      upload a syllabus for one of your own courses.
    </Container>
  );
};

export default LoggedInHome;
