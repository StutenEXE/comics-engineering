import type { Route } from "./+types/home";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Book ${params.id}` },
    { name: "description", content: `Viewing book ${params.id}` },
  ];
}

export default function BookRouting({ params }: { params : { id: number}}) {
  return (
    <div>
        Book id : {params.id}
    </div>
  );
}
