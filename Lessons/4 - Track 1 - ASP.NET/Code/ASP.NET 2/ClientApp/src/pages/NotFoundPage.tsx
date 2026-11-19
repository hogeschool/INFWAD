import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div>
      <h1>404 - page not found</h1>
      <p>That page does not exist.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}
