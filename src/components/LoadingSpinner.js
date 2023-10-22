import React from "react";
import PropTypes from "prop-types";
import Spinner from "react-bootstrap/esm/Spinner.js";

const LoadingSpinner = ({ purpose }) => {
  return (
    <div className="loading-spinner">
      <span>{purpose}</span>
      <Spinner animation="grow" variant="primary" />
    </div>
  );
};

LoadingSpinner.propTypes = {
  purpose: PropTypes.string,
};

export default LoadingSpinner;
