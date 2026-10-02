import type { Book } from "~/models/book";
import { useIssueByBookIdQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import { IssueList } from "./IssueList";

interface IssueListByBooksIdProps {
  bookId: number | null | undefined;
  toIgnore?: Book | null | undefined;
  descOrder?: boolean;
  className?: string;
}

export function IssueListByBookId({
  bookId,
  toIgnore,
  descOrder,
  className,
}: IssueListByBooksIdProps) {
  if (!bookId) {
    return <IssueList issueList={[]} className={className} />;
  }

  const { data, isLoading, error } = useIssueByBookIdQuery({ id: bookId });
  const issues = data?.issues ?? null;
  const err = createError(error);

  return (
    <IssueList
      issueList={issues?.filter((is) => !toIgnore || is.id !== toIgnore.id)}
      isLoading={isLoading}
      error={err}
      className={className}
    />
  );
}
