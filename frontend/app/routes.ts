import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/landing.tsx"),
  route("search", "pages/search.tsx"),

  route("book/:id", "pages/book.tsx"),
  route("issue_serie/:id", "pages/issue-serie.tsx"),
  route("issue/:id", "pages/issue.tsx"),
  route("serie/:id", "pages/serie.tsx"),

  route("contribute", "pages/contribute.tsx"),
  route("collection", "pages/collection.tsx", [
    index("pages/collection/editions.tsx"),
    route("series", "pages/collection/series.tsx"),
    route("contributions", "pages/collection/contributions.tsx"),
  ]),

  route("users", "pages/users.tsx"),
  route("contributions", "pages/contributions.tsx"),
] satisfies RouteConfig;
