import LoggedInHome from "./LoggedInHome";
import LoggedOutHome from "./LoggedOutHome";
import { Container } from "@mantine/core";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return <Container className="home" p="xl" ta="center">Checking authentication...</Container>;
  }
  // TODO: Loader circle for this ^

  return (
    <>
      {isAuthenticated ?
        <LoggedInHome />
      : <LoggedOutHome />}
    </>
  );
};

export default Home;
