
import MainLayout from "@/components/layout/MainLayout";

/**
 * Страница управления компаниями
 * 
 * @returns {JSX.Element} Компонент страницы компаний
 */
const CompaniesPage = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Компании</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Здесь будет располагаться система управления компаниями с полной информацией об организациях.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default CompaniesPage;
