import { createContext, useContext } from 'react';
import { AuthUser, getGetMeQueryKey, useGetMe } from '@workspace/api-client-react';

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      retry: false,
      queryKey: getGetMeQueryKey(),
    }
  });

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
