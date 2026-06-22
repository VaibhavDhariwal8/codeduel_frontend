import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "../components/Layout";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" />;
  return children;
}
