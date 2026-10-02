import { useEffect, useMemo, useState } from "react";
import { OwnedEditionCard } from "~/components/cards/OwnedEditionCard";
import { ProfileHeader } from "~/components/headers/ProfileHeader";
import { GenericList } from "~/components/lists/GenericList";
import { LoggedProtectedRoute } from "~/components/security/LoggedProtectedRoute";
import {
  InfoPageFields,
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { ProfileModal } from "~/components/modals/ProfileModal";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import {
  useCollectionQuery,
  useContributionStatsBySubmitterIdQuery,
  usePublicUserByIdQuery,
} from "~/store/services/api";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

const LATEST_ADDITIONS_COUNT = 5;

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Profile" },
    {
      name: "description",
      content: params.id ? `Viewing user ${params.id}` : "My profile",
    },
  ];
}

export default function ProfilePage({ params }: { params: { id?: string } }) {
  // No id in the url : own profile, requires being logged in
  if (!params.id) {
    return (
      <LoggedProtectedRoute>
        <OwnProfile />
      </LoggedProtectedRoute>
    );
  }
  return <Profile userId={Number(params.id)} />;
}

function OwnProfile() {
  const { user } = useAppSelector((state) => state.user);
  return <Profile userId={user!.id} />;
}

function Profile({ userId }: { userId: number }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const isOwnProfile = isAuthenticated && user?.id === userId;

  // Profile
  const { data, isFetching, error, refetch } = usePublicUserByIdQuery({
    id: userId,
  });
  const profile = data?.user;
  const err = createError(error);

  // Contributions
  const { data: statsData, isFetching: isStatsFetching } =
    useContributionStatsBySubmitterIdQuery({ id: userId });

  // Collection (only accessible when logged in)
  const { data: collectionData, isFetching: isCollectionFetching } =
    useCollectionQuery({ id: userId }, { skip: !isAuthenticated });

  // Latest additions to the collection (highest ids were added last)
  const latestAdditions = useMemo(
    () =>
      [...(collectionData?.ownedEditions ?? [])]
        .sort((a, b) => b.id - a.id)
        .slice(0, LATEST_ADDITIONS_COUNT),
    [collectionData],
  );

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const closeEditModal = () => setIsEditModalOpen(false);

  // Page title update
  useEffect(() => {
    if (profile?.username) {
      document.title = profile.username;
    }
  }, [profile]);

  const mapper = (oe: OwnedEdition) => (
    <div key={oe.id} className="w-30">
      <OwnedEditionCard oedition={oe} />
    </div>
  );

  return (
    <>
      <InfoPageTemplate hasImg={false} isLoading={isFetching} error={err}>
        <ProfileHeader
          username={profile?.username}
          isAdmin={profile?.isAdmin}
          createdAt={profile?.createdAt}
          onEditClick={
            isOwnProfile ? () => setIsEditModalOpen(true) : undefined
          }
          isLoading={isFetching}
        />

        <InfoPageFields
          isLoading={isFetching || isStatsFetching}
          fieldProps={[
            {
              label: t("profile.contributions"),
              value: statsData?.stats.total ?? 0,
            },
          ]}
        />

        <InfoPageSection
          label={t("profile.latestAdditions")}
          isLoading={isFetching}
        >
          <GenericList
            list={latestAdditions}
            emptyMsg={
              isAuthenticated
                ? t("profile.latestAdditions.empty")
                : t("profile.latestAdditions.notconnected")
            }
            elemGenerator={mapper}
            isLoading={isCollectionFetching}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>
      </InfoPageTemplate>
      {isOwnProfile && (
        <ProfileModal
          user={user!}
          isOpen={isEditModalOpen}
          onDone={() => {
            closeEditModal();
            refetch();
          }}
          onCancel={closeEditModal}
        />
      )}
    </>
  );
}
