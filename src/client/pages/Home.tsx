import { useAuth } from "@/contexts/AuthContext";
import { Container, Loader, Title } from "@mantine/core";
import LoggedInHome from "./LoggedInHome";
import LoggedOutHome from "./LoggedOutHome";

const Home = () => {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return (
      <Container className="home" p="xl" ta="center">
        <Title order={1} mb="md">
          Welcome to <b style={{ color: "var(--cwrublue)" }}>Syllabus Station</b>!
        </Title>
        Checking authentication... <s />
        <Loader size={18} />
      </Container>
    );
  }

  return <>{isAuthenticated ? <LoggedInHome /> : <LoggedOutHome />}</>;
};

export default Home;
