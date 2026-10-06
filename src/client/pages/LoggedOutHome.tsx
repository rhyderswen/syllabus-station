import { Container, UnstyledButton } from "@mantine/core";

const LoggedOutHome = () => {
  return (
    <Container className="home" p="md" style={{textAlign:"center"}}>
      <h2>Welcome to <b style={{color: 'var(--cwrublue)'}}>Syllabus Station</b>!</h2>
      {
      // not too attached to CWRU blue for the name here ^, 
      // but until we have a proper logo/color scheme figured out, it's fine
      }
      In order to view and add syllabi, you must{" "}
      <UnstyledButton style={{color:"var(--cwrutrueblue)", fontSize:20, }} onClick={() => console.log("log in would happen here!")}>
        sign in
      </UnstyledButton>{" "}
      with your CWRU account.
    </Container>
  );
};

export default LoggedOutHome;
