import { Container, UnstyledButton } from "@mantine/core";

const LoggedInHome = () => {
  return (
    <Container className="home" p="md">
      You are now logged into to <b>Syllabus Station</b>, your best tool for reading CWRU syllabi. If you want, you can,{" "}
      <UnstyledButton onClick={() => console.log("log in would happen here!")}>
        log out
      </UnstyledButton>{" "}
      of your CWRU account!
    </Container>
  );
};

export default LoggedInHome;
