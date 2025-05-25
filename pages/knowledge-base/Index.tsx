
import MainLayout from "@/components/layout/MainLayout";

/**
 * Страница базы знаний
 * 
 * @returns {JSX.Element} Компонент страницы базы знаний
 */
const KnowledgeBasePage = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">База знаний</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Здесь будет располагаться база знаний с возможностью создания и редактирования статей.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default KnowledgeBasePage;
