import { useBookByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Book ${params.id}` },
    { name: "description", content: `Viewing book ${params.id}` },
  ];
}

export default function BookPage({ params }: { params : { id: number}}) {
  
  const { data, isLoading, error } = useBookByIdQuery({ id: params.id });
  const book = data?.book ?? null;


  
  return (
    <main>
        {isLoading && <p className="text-gray-500">Loading book...</p>}

        
    </main>
  );
}