
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Страница CRM-модуля
 * 
 * @returns {JSX.Element} Компонент страницы CRM
 */
const CRMPage = (): JSX.Element => {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">CRM</h1>
        
        <div className="flex gap-4 mb-8">
          <Button onClick={() => navigate("/crm/contacts")}>
            Контакты
          </Button>
          <Button onClick={() => navigate("/crm/companies")}>
            Компании
          </Button>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Здесь будет располагаться CRM-система для управления контактами и компаниями.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default CRMPage;
