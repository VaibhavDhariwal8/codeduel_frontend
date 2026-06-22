import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./lib/AuthContext";
import ProtectedRoute from "./lib/ProtectedRoute";

import DuelArena from "./pages/DuelArena";
import Lobby from "./pages/Lobby";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Problems from "./pages/Problems";
import Result from "./pages/Result";
import Layout from "./components/Layout";
import Friends from "./pages/Friends";

function Root() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return <Navigate to={session ? "/dashboard" : "/login"} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/duel/:matchId/result"
            element={
              <ProtectedRoute>
                <Layout>
                  <Result />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Root />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Lobby />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/duel/:matchId"
            element={
              <ProtectedRoute>
                <DuelArena />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <Layout>
                  <Problems />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Layout>
                  <Friends />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
