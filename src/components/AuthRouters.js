import React from "react";
import { Navigate } from 'react-router-dom';

export const AuthorizedRoute = ({ isAuthorized, children }) => {
    if (isAuthorized === true) {
        return children;
    } else {
        return <Navigate to="/login"/>;
    }
};

export const UnauthorizedRoute = ({ isAuthorized, isAdmin, children }) => {
    if (isAuthorized === false) {
        return children;
    } else {
        return <Navigate to="/generator"/>;
    }
};