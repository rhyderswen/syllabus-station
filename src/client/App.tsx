import Wrapper from "@/components/Wrapper";
import Error from "@/pages/Error";
import Home from "@/pages/Home";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import "./App.css";
import CoursePage from "./pages/CoursePage";
import { AuthProvider } from "./contexts/AuthContext";

function Layout() {
  return (
    <AuthProvider>
      <Wrapper>
        <Outlet />
      </Wrapper>
    </AuthProvider>
  );
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
            element: <CoursePage />,
            // element: <Navigate to="/" replace />,
          },
          {
            path: ":courseCode", // matches /course/:courseCode
            element: <CoursePage />,
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
