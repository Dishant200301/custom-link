import { useAuth } from "@/hooks/useStore";
import AdminAuth from "@/components/AdminAuth";
import AdminPanel from "@/components/AdminPanel";

const Admin = () => {
  const authed = useAuth();
  return authed ? <AdminPanel /> : <AdminAuth />;
};
export default Admin;
