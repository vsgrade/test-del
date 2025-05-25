
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Корневой компонент страницы
 * Перенаправляет на дашборд или страницу входа в зависимости от статуса аутентификации
 */
const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Здесь можно добавить инициализационную логику
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
