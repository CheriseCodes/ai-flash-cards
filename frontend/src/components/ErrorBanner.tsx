import React, { Dispatch, SetStateAction } from "react";
import PropTypes from "prop-types";
import { Alert } from "react-bootstrap";

const ErrorBanner = ({ e, setErrors } : {e: ErrorMessage, setErrors: Dispatch<SetStateAction<Array<ErrorMessage>>>}) => {
  return (
    <Alert
      className="error-banner"
      variant="danger"
      onClose={() =>
        setErrors((errs) =>
          errs.filter((err) => {
            return err.id !== e.id;
          }),
        )
      }
      dismissible
    >
      <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
      <p>{e.message}</p>
    </Alert>
  );
};

ErrorBanner.propTypes = {
  e: PropTypes.object,
  setErrors: PropTypes.func,
};

export default ErrorBanner;
