import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/landing.tsx"),
  route("search", "pages/search.tsx"),

  route("book/:id", "pages/book.tsx"),
  route("issueserie/:id", "pages/issue-serie.tsx"),
  route("issue/:id", "pages/issue.tsx"),
  route("serie/:id", "pages/serie.tsx"),

  route("contribute", "pages/contribute.tsx"),
  route("stash", "pages/stash.tsx", [
    index("pages/stash/editions.tsx"),
    route("bookshelf", "pages/stash/bookshelf.tsx"),
    route("series", "pages/stash/series.tsx"),
    route("contributions", "pages/stash/contributions.tsx"),
  ]),

  route("users", "pages/users.tsx"),
  route("contributions", "pages/contributions.tsx"),
] satisfies RouteConfig;
