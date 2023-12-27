import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <Spinner className="spinner" animation="grow" variant="primary" />
    </div>
  );
};

export default LoadingSpinner;
