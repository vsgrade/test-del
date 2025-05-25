
import MainLayout from "@/components/layout/MainLayout";

/**
 * Страница отчетов и аналитики
 * 
 * @returns {JSX.Element} Компонент страницы отчетов
 */
const ReportsPage = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Отчеты и аналитика</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Здесь будет располагаться система построения отчетов и аналитики с гибким конструктором.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
