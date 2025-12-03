import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("pages/landing.tsx"),
    route("book/:id", "pages/book.tsx"),
    route("edition/:id", "pages/edition.tsx")
] satisfies RouteConfig;
