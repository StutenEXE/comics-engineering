import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Comics-engineering" },
    { name: "description", content: "Welcome to Comics-engineering!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
