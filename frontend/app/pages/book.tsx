import type { Route } from "../+types/root";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Book ${params.id}` },
    { name: "description", content: `Viewing book ${params.id}` },
  ];
}

export default function BookPage({ params }: { params : { id: number}}) {
  
  
  
  return (
    <main>

    </main>
  );
}