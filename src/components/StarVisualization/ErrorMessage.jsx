import React from "react";
import PropTypes from "prop-types";

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded">
      Error loading star data: {error}
    </div>
  );
};

ErrorMessage.propTypes = {
  error: PropTypes.string.isRequired,
};

export default ErrorMessage;
