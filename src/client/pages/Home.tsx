import { useAuth } from "@/contexts/AuthContext";
import LoggedInHome from "./LoggedInHome";
import LoggedOutHome from "./LoggedOutHome";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return <>{isAuthenticated ? <LoggedInHome /> : <LoggedOutHome />}</>;
};

export default Home;
