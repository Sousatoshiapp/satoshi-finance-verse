import { useAuthUser } from "@/contexts/AuthUserContext";
import { useAuthStatus } from "@/contexts/AuthStatusContext";

export function useAuth() {
  const { user, session } = useAuthUser();
  const { loading, signOut } = useAuthStatus();

  return {
    user,
    session,
    loading,
    signOut,
  };
}