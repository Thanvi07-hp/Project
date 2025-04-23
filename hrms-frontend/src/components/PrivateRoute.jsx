import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", localStorage.getItem("token"));

  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
