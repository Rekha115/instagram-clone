import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-semibold mb-2">Sorry, this page isn&apos;t available.</h1>
      <p className="text-ig-dim mb-6 max-w-sm">
        The link you followed may be broken, or the page may have been removed.
      </p>
      <Link to="/" className="text-ig-blue font-semibold text-sm">
        Go back to Instagram
      </Link>
    </div>
  );
}
