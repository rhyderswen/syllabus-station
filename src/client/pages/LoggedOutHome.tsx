import { Container, Title } from "@mantine/core";
import { Link } from "react-router";

const LoggedOutHome = () => {
  return (
    <Container className="home" p="xl" ta="center">
      <Title order={1} mb="md">
        Welcome to <b style={{ color: "var(--cwrublue)" }}>Syllabus Station</b>!
      </Title>
      In order to view and add syllabi, you must{" "}
      <Link to="/login" target="_parent">
        sign in
      </Link>{" "}
      with your CWRU account.
    </Container>
  );
};

export default LoggedOutHome;
