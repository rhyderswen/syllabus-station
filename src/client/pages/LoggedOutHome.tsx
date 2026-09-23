import { Container, UnstyledButton } from "@mantine/core";

const LoggedOutHome = () => {
  return (
    <Container className="home" p="md">
      Welcome to <b>Syllabus Station</b>, your best tool for reading CWRU syllabi. To get started,{" "}
      <UnstyledButton onClick={() => console.log("log in would happen here!")}>
        sign in
      </UnstyledButton>{" "}
      with your CWRU account!
    </Container>
  );
};

export default LoggedOutHome;
