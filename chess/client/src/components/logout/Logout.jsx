import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/userAuth";   // ✅ correct import

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();                               // clear auth state
    navigate("/login", { replace: true });  // redirect after logout
  }, [logout, navigate]);

  return null;
}

export default Logout;
