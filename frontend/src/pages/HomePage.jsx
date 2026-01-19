import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  SparklesIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [pendingRequestUserId, setPendingRequestUserId] = useState(null);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const mutation = useMutation({
    mutationFn: sendFriendRequest,
    onMutate: (userId) => {
      setPendingRequestUserId(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onSettled: () => {
      setPendingRequestUserId(null);
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
    }
    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-bl from-base-100 to-base-200 min-h-screen">
      <div className="container mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-7 mb-2">
          <div className="flex items-center gap-2">
            <UsersIcon className="text-primary size-6" />
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-lg">
              Your Friends
            </h2>
          </div>
          <Link
            to="/notifications"
            className="btn btn-outline btn-primary btn-sm shadow transition-transform hover:scale-105"
          >
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-7 sm:mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="text-secondary size-6" />
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent drop-shadow-lg">
                  Meet New Learners
                </h2>
              </div>
              {/* Optionally, you can add some call to action or filter here */}
            </div>
            <p className="opacity-80 mt-2 text-base ml-[33px]">
              Discover perfect language exchange partners based on your profile.
            </p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-secondary" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 border-l-4 border-secondary p-8 text-center shadow-lg">
              <h3 className="font-semibold text-xl mb-3 text-secondary">No recommendations available</h3>
              <p className="text-base-content opacity-80">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                const isRequestPending = pendingRequestUserId === user._id;

                return (
                  <div
                    key={user._id}
                    className="card bg-gradient-to-tl from-base-200 via-base-100 to-base-300 border border-primary/10 hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-2xl overflow-hidden"
                  >
                    <div className="card-body p-6 space-y-5">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="avatar size-20 rounded-lg ring ring-primary/30 ring-offset-2 ring-offset-base-100 shadow-sm overflow-hidden">
                          <img src={user.profilePic} alt={user.fullName} className="object-cover w-full h-full" />
                        </div>

                        <div>
                          <h3 className="font-bold text-lg text-base-content mb-1">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1 text-secondary" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-secondary badge-lg font-semibold px-3 py-2 shadow-sm">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline badge-lg px-3 py-2 font-semibold shadow-sm">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-base opacity-70 py-2 px-3 bg-base-300/50 rounded-lg border-l-4 border-primary text-base-content">
                          {user.bio}
                        </p>
                      )}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-3 text-base font-semibold transition-all ${
                          hasRequestBeenSent
                            ? "btn-disabled bg-base-200 text-base-content/60 cursor-not-allowed"
                            : isRequestPending
                            ? "btn-disabled bg-base-200 text-base-content/60 cursor-wait"
                            : "btn-primary shadow-lg hover:scale-[1.03] hover:bg-primary/80"
                        } `}
                        onClick={() => mutation.mutate(user._id)}
                        disabled={hasRequestBeenSent || isRequestPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-5 mr-2 text-success" />
                            Request Sent
                          </>
                        ) : isRequestPending ? (
                          <>
                            <span className="loading loading-spinner loading-xs mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-5 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;