import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/companion-form";
import { Companion } from "@prisma/client";
import { auth, redirectToSignIn } from "@clerk/nextjs";

interface CompanionIdPageProps {
  params: {
    companionId: string | "new";
  };
}   

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
  //TODO: Check subscription
  

  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }
  
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
