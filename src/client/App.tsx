import "@/App.css";
import Wrapper from "@/components/Wrapper";
import CoursePage from "@/pages/CoursePage";
import Error from "@/pages/Error";
import Home from "@/pages/Home";
import { courseQuery, queryClient } from "@/util/api";
import { Container, Loader } from "@mantine/core";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  type LoaderFunctionArgs,
} from "react-router";
import { parseCourseCodeFromURL } from "~/textFormatting";
import { useAuth } from "./contexts/AuthContext";

function Layout() {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
  );
}

function BlockBanned() {
  const { status, isBanned } = useAuth();

  if (status === "loading") {
    return (
      <Container className="home" p="xl" ta="center">
        Checking authentication... <s />
        <Loader size={18} />
      </Container>
    );
  }

  if (isBanned) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

async function courseLoader({ params }: LoaderFunctionArgs) {
  const courseCode = parseCourseCodeFromURL(params.courseCode!);

  return queryClient.query({ ...courseQuery(courseCode), staleTime: "static" });
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/course",
        element: <BlockBanned />,
        children: [
          {
            index: true, // matches exactly /course
            element: <Navigate to="/" replace />,
          },
          {
            path: ":courseCode", // matches /course/:courseCode
            element: <CoursePage />,
            loader: courseLoader,
            errorElement: <Navigate to="/" replace />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
