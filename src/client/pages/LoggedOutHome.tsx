import { Container, Title, UnstyledButton } from "@mantine/core";

const LoggedOutHome = () => {
  return (
    <Container className="home" p="xl" ta="center">
      <Title order={1} mb="md">
        Welcome to <b style={{ color: "var(--cwrublue)" }}>Syllabus Station</b>!
      </Title>
      {
        // not too attached to CWRU blue for the name here ^,
        // but until we have a proper logo/color scheme figured out, it's fine
      }
      In order to view and add syllabi, you must{" "}
      <UnstyledButton
        c="var(--cwrutrueblue)"
        fz="inherit"
        onClick={() => console.log("log in would happen here!")}
      >
        sign in
      </UnstyledButton>{" "}
      with your CWRU account.
    </Container>
  );
};

export default LoggedOutHome;
