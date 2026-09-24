import { Container, UnstyledButton } from "@mantine/core";

const LoggedInHome = () => {
  return (
    <Container className="home" p="md" style={{textAlign:"center"}}>
      You are now logged into to <b>Syllabus Station</b>, your best tool for reading CWRU syllabi!
      <br></br> 
      <br></br>
      Use the search bar above to find any course's syllabus that you want.
      <br></br>
      <br></br>
      Or, if you notice that a syllabus is missing, you can press the button in the top right to upload 
      a syllabus for one of your own courses.
    </Container>
  );
};

export default LoggedInHome;
