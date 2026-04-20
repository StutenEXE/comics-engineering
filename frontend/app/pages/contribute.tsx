import { useAppSelector } from "~/store/hooks";
import { PageTemplate } from "~/components/templates/PageTemplate";
import { useTranslation } from "~/i18n/i18n";
import { GenericButton } from "~/components/buttons/GenericButton";
import { GenericTable, type ColumnDef } from "~/components/tables/GenericTable";

interface Contribution {
  id: number;
  type: string;
  item: string;
  date: string;
  status: string;
}

export default function ContributePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

  // Mock data for previous contributions
  const contributions: Contribution[] = [
    {
      id: 1,
      type: "Book",
      item: "Batman #1",
      date: "2024-01-15",
      status: "Approved",
    },
    {
      id: 2,
      type: "Serie",
      item: "Marvel Universe",
      date: "2024-02-20",
      status: "Pending",
    },
    {
      id: 3,
      type: "Edition",
      item: "Batman #1 - Deluxe",
      date: "2024-03-10",
      status: "Approved",
    },
  ];

  // Mock statistics
  const stats = {
    totalContributions: 42,
    approved: 35,
    pending: 5,
    rejected: 2,
  };

  const columns: ColumnDef<Contribution>[] = [
    { key: "type", header: t("contribute.table.type"), searchable: true },
    { key: "item", header: t("contribute.table.item"), searchable: true },
    { key: "date", header: t("contribute.table.date"), searchable: true },
    { key: "status", header: t("contribute.table.status"), searchable: true },
  ];

  if (!isAuthenticated) {
    return (
      <main>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <h1 className="text-3xl font-bold text-gray-200">
            {t("contribute.title")}
          </h1>
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center max-w-md">
            <p className="text-xl text-gray-300 mb-4">
              {t("contribute.loginRequired")}
            </p>
            <p className="text-gray-400">{t("contribute.loginRequiredDesc")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center pt-8 px-4 lg:px-8 xl:px-12">
      <div className="w-full max-w-6xl space-y-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-6">{t("contribute.title")}</h1>

        {/* Welcome message */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-300 text-lg">
            {t("contribute.welcome")}{" "}
            <span className="font-semibold text-white">{user?.username}</span>!
          </p>
        </div>

        {/* Contribution options */}
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold text-gray-200">
            {t("contribute.options")}
          </h2>
          <div className="flex flex-wrap gap-4">
            <GenericButton onClick={() => {}} className="px-6 py-3">
              {t("contribute.addBook")}
            </GenericButton>
            <GenericButton onClick={() => {}} className="px-6 py-3">
              {t("contribute.addSerie")}
            </GenericButton>
            <GenericButton onClick={() => {}} className="px-6 py-3">
              {t("contribute.addEdition")}
            </GenericButton>
            <GenericButton onClick={() => {}} className="px-6 py-3">
              {t("contribute.addIssue")}
            </GenericButton>
            <GenericButton onClick={() => {}} className="px-6 py-3">
              {t("contribute.addIssueSerie")}
            </GenericButton>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-200">
            {t("contribute.stats")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-blue-400">
                {stats.totalContributions}
              </p>
              <p className="text-gray-400">{t("contribute.stats.total")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-green-400">
                {stats.approved}
              </p>
              <p className="text-gray-400">{t("contribute.stats.approved")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {stats.pending}
              </p>
              <p className="text-gray-400">{t("contribute.stats.pending")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-red-400">
                {stats.rejected}
              </p>
              <p className="text-gray-400">{t("contribute.stats.rejected")}</p>
            </div>
          </div>
        </div>

        {/* Previous contributions table */}
        <div className="flex flex-col gap-6 pb-8">
          <h2 className="text-2xl font-semibold text-gray-200">
            {t("contribute.history")}
          </h2>
          <GenericTable
            list={contributions}
            columns={columns}
            emptyMessage={t("contribute.noContributions")}
          />
        </div>
      </div>
    </main>
  );
}
