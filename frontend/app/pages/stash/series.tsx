import type { Route } from "../../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Collection Series` },
    { name: "description", content: `Series from your collection` },
  ];
}

export default function CollectionSeriesPage() {
  return <h1>TODO</h1>
}
