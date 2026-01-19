import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserFriends,
  getFriendRequests,
  getOutgoingFriendReqs,
  acceptFriendRequest,
} from "../lib/api";
import { LoaderIcon, MailCheck, UserPlus2, Users, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

// Helper to always ensure an array
const toArray = (data) => (Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);

const UserCard = ({ src, alt, name, subtitle, actions = null, extra = null, children }) => (
  <div className="flex items-center justify-between gap-4 bg-white dark:bg-base-200 shadow border rounded-xl px-5 py-4 transition-all hover:shadow-lg">
    <div className="flex items-center gap-4">
      <img
        src={src}
        alt={alt}
        className="size-16 min-w-16 rounded-full border-2 border-primary object-cover shadow"
      />
      <div>
        <p className="font-bold text-lg">{name}</p>
        {subtitle && <p className="text-sm text-gray-500 dark:text-base-content/60">{subtitle}</p>}
        {children}
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      {actions}
      {extra}
    </div>
  </div>
);

const GetFriends = () => {
  const qc = useQueryClient();

  // ✅ Accepted Friends
  const {
    data: friendsData,
    isLoading: loadingFriends,
    isError: errorFriends,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // ⏳ Incoming Requests
  const {
    data: incomingData,
    isLoading: loadingIncoming,
    isError: errorIncoming,
  } = useQuery({
    queryKey: ["incomingRequests"],
    queryFn: getFriendRequests,
  });

  // ⏳ Outgoing Requests
  const {
    data: outgoingData,
    isLoading: loadingOutgoing,
    isError: errorOutgoing,
  } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingFriendReqs,
  });

  // sanitize to always arrays
  const friends = toArray(friendsData);
  const incoming = toArray(incomingData);
  const outgoing = toArray(outgoingData);

  // ✅ Accept Request
  const { mutate: acceptReq, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      toast.success("Friend request accepted!");
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["incomingRequests"] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to accept request"),
  });

  const isLoading = loadingFriends || loadingIncoming || loadingOutgoing;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px]">
        <LoaderIcon className="animate-spin size-8 text-primary mb-2" />
        <span className="text-base opacity-60">Loading friends...</span>
      </div>
    );
  }

  if (errorFriends || errorIncoming || errorOutgoing) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="text-red-500 font-semibold text-lg mb-2">
          Failed to load friend data.
        </div>
        <span className="opacity-50">Please try refreshing the page.</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8 text-primary flex items-center gap-2">
        <Users className="size-7" />
        Friend Manager
      </h1>

      {/* ⏳ INCOMING REQUESTS */}
      <section className="mb-10">
        <div className="flex items-center mb-3 gap-2">
          <MailCheck className="text-accent size-5" />
          <h2 className="text-xl font-semibold text-base-content">Incoming Friend Requests</h2>
          <span className="ml-2 badge badge-accent badge-outline font-medium">
            {incoming.length}
          </span>
        </div>
        {incoming.length === 0 ? (
          <p className="italic text-base-content/60 mb-6 px-2">No new friend requests.</p>
        ) : (
          <div className="flex flex-col gap-4 mb-6">
            {incoming.map((req) =>
              req?.sender ? (
                <UserCard
                  key={req._id}
                  src={req.sender.profilePic}
                  alt={req.sender.fullName}
                  name={req.sender.fullName}
                  subtitle={
                    <>
                      {req.sender.email && (
                        <span className="opacity-80">Email: {req.sender.email}</span>
                      )}
                      {req.sender.nativeLanguage && req.sender.learningLanguage && (
                        <div>
                          <span className="font-medium">{req.sender.nativeLanguage}</span>
                          <span className="mx-1 text-gray-400">→</span>
                          <span className="font-medium">{req.sender.learningLanguage}</span>
                        </div>
                      )}
                      {req.sender.bio && (
                        <div className="mt-1 text-xs opacity-80">
                          {req.sender.bio.slice(0, 60)}
                          {req.sender.bio.length > 60 ? "..." : ""}
                        </div>
                      )}
                    </>
                  }
                  actions={
                    <button
                      className="btn btn-success btn-sm px-5 font-semibold shadow"
                      disabled={isPending}
                      onClick={() => acceptReq(req._id)}
                    >
                      <UserPlus2 className="size-4 mr-2" />
                      Accept
                    </button>
                  }
                />
              ) : null
            )}
          </div>
        )}
      </section>

      {/* ⏳ OUTGOING REQUESTS */}
      <section className="mb-10">
        <div className="flex items-center mb-3 gap-2">
          <MessageSquare className="text-primary size-5" />
          <h2 className="text-xl font-semibold text-base-content">Pending Sent Requests</h2>
          <span className="ml-2 badge badge-primary badge-outline font-medium">
            {outgoing.length}
          </span>
        </div>
        {outgoing.length === 0 ? (
          <p className="italic text-base-content/60 mb-6 px-2">No outgoing friend requests.</p>
        ) : (
          <div className="flex flex-col gap-4 mb-6">
            {outgoing.map((req) =>
              req?.recipient ? (
                <UserCard
                  key={req._id}
                  src={req.recipient.profilePic}
                  alt={req.recipient.fullName}
                  name={req.recipient.fullName}
                  subtitle={
                    <>
                      {req.recipient.email && (
                        <span className="opacity-80">Email: {req.recipient.email}</span>
                      )}
                      {req.recipient.nativeLanguage && req.recipient.learningLanguage && (
                        <div>
                          <span className="font-medium">{req.recipient.nativeLanguage}</span>
                          <span className="mx-1 text-gray-400">→</span>
                          <span className="font-medium">{req.recipient.learningLanguage}</span>
                        </div>
                      )}
                      {req.recipient.bio && (
                        <div className="mt-1 text-xs opacity-80">
                          {req.recipient.bio.slice(0, 60)}
                          {req.recipient.bio.length > 60 ? "..." : ""}
                        </div>
                      )}
                    </>
                  }
                  extra={
                    <span className="badge badge-ghost text-primary text-xs">
                      Request Pending
                    </span>
                  }
                />
              ) : null
            )}
          </div>
        )}
      </section>

      {/* ✅ ACCEPTED FRIENDS */}
      <section className="mb-10">
        <div className="flex items-center mb-3 gap-2">
          <Users className="text-success size-5" />
          <h2 className="text-xl font-semibold text-base-content">
            Your Friends
          </h2>
          <span className="ml-2 badge badge-success badge-outline font-medium">
            {friends.length}
          </span>
        </div>
        {friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GetFriends;
