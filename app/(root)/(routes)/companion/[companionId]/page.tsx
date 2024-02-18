import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/companion-form";
import { Companion } from "@prisma/client";

interface CompanionIdPageProps {
  params: {
    companionId: string | "new";
  };
}   

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
  //TODO: Check subscription

  let companion: Companion | null;

  if(params.companionId === "new") {
    companion = null;
  }
  else{
    companion = await prismadb.companion.findUnique({
      where: {
        id: params.companionId,
      },
    });
  }
  
  const categories = await prismadb.category.findMany();

  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
