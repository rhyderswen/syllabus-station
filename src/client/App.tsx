import Wrapper from "@/components/Wrapper";
import Error from "@/pages/Error";
import Home from "@/pages/Home";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  Navigate,
  type LoaderFunctionArgs,
} from "react-router";
import "./App.css";
import CoursePage from "./pages/CoursePage";
import { AuthProvider } from "./contexts/AuthContext";
import { queryClient, courseQuery } from "./util/api";
import { parseCourseCodeFromURL } from "../shared/textFormatting";
import { redirect } from "react-router";

function Layout() {
  return (
    <AuthProvider>
      <Wrapper>
        <Outlet />
      </Wrapper>
    </AuthProvider>
  );
}

async function courseLoader({ params }: LoaderFunctionArgs) {
  const courseCode = parseCourseCodeFromURL(params.courseCode!);

  return queryClient.ensureQueryData(courseQuery(courseCode));
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
        children: [
          {
            index: true, // matches exactly /course
            element: <Navigate to="/" replace />,
          },
          {
            path: ":courseCode", // matches /course/:courseCode
            element: <CoursePage />,
            loader: courseLoader,
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
