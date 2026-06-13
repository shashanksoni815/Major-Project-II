import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    const raw = localStorage.getItem("ams-auth-v1");
    let authed = false;
    try { authed = !!JSON.parse(raw ?? "{}")?.state?.user; } catch { /* noop */ }
    navigate(authed ? "/dashboard" : "/login", { replace: true });
  }, [navigate]);
  return null;
}
