export function meta() {
  return [
    { title: "About" },
    { name: "description", content: "About this app" },
  ];
}

export default function About() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-bold">About</h1>
      <p className="mt-2">This is a simple About page for the comics-engineering app.</p>
    </main>
  );
}
