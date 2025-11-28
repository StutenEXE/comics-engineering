import type { Route } from "./+types/home";
import { Landing } from "../pages/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Comics-engineering" },
    { name: "description", content: "Welcome to Comics-engineering!" },
  ];
}

export default function Home() {
  return <Landing />;
}
