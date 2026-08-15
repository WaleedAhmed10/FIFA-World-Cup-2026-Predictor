import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container mt-5 text-center">
    <h1>404</h1>
    <p className="lead">Page not found.</p>
    <Link to="/" className="btn btn-primary">Go Home</Link>
  </div>
);

export default NotFound;
