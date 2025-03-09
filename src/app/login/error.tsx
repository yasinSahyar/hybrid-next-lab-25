'use client'; // Error boundaries must be Client Components

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorText, setErrorText] = useState('');
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    setErrorText(error.message);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{errorText}</p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}