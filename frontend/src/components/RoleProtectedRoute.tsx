import { Navigate } from "react-router-dom";
import { getToken, getCachedUser } from "@/lib/auth";

export interface RoleProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/auth",
}) => {
  const token = getToken();
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  const user = getCachedUser();
  const role = (user as any)?.role;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;