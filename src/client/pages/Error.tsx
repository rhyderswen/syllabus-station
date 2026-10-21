import { Center, Stack } from "@mantine/core";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();
  console.log(error);

  // Handle route errors with status codes
  if (isRouteErrorResponse(error)) {
    return (
      <Stack className="errorPage" align="center">
        <h1 style={{ marginTop: 0 }}>
          {error.status} - {error.statusText || error.data}
        </h1>
        {error.status === 404 && (
          <p>The resource you're looking for doesn't exist.</p>
        )}
        <Link to="/">Go Home</Link>
      </Stack>
    );
  }

  // Fallback for unexpected errors
  return (
    <Center className="errorPage">
      <h1>Oops! Something went wrong.</h1>
    </Center>
  );
}
