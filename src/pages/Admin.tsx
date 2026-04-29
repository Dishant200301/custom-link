import { useSession } from "@/hooks/useStore";
import AdminAuth from "@/components/AdminAuth";
import AdminPanel from "@/components/AdminPanel";

const Admin = () => {
  const { session, loading } = useSession();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(16_90%_65%)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }
  return session ? <AdminPanel session={session} /> : <AdminAuth />;
};
export default Admin;
