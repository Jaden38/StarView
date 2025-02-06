import React from "react";

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded">
      Error loading star data: {error}
    </div>
  );
};

export default ErrorMessage;
