import Wrapper from "@/components/Wrapper";
import Error from "@/pages/Error";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import "./App.css";
import Home from "@/pages/Home";


function Layout() {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
