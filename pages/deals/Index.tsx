
import MainLayout from "@/components/layout/MainLayout";

/**
 * Страница управления сделками
 * 
 * @returns {JSX.Element} Компонент страницы сделок
 */
const DealsPage = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Сделки</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Здесь будет располагаться система управления сделками с воронками продаж.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DealsPage;
