import { Sidebar } from "@/components/admin/sidebar";
import { ProfileMain } from "@/components/admin/profile/profile-main";
import { getServerSession } from "next-auth";
// Assuming this action now fetches profile details by username
import { getUserDetails } from "@/actions/user-actions";
import { UserNotFound } from "@/components/admin/users/user-not-found";
import { redirect } from "next/navigation"; // New import for redirection
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Define a default profile picture URL (since localStorage is inaccessible on the server)
const DEFAULT_PROFILE_PIC =
  "https://placehold.co/100x100/A0E7E5/000000?text=👤";

// --- Utility function for dynamic role badge styling (based on schema) ---
// Note: Using string for role here as the type is not easily imported into this file context
const getRoleStyle = (role: string) => {
  const upperRole = role.toUpperCase();
  switch (upperRole) {
    case "TRAVELER":
      return "bg-pink-100 text-pink-700 border-pink-300";
    case "OPERATOR":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "CREATOR":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "AGENT":
      return "bg-green-100 text-green-700 border-green-300";
    case "ADMIN":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};
// ----------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ username: string }>;
}

const UserPage = async ({ params }: PageProps) => {
  const resolvedParams = await params; // await since it's a Promise

  // 1. Fetch logged-in user session first
  const session = await getServerSession(authOptions);
  const currentUser = session?.user;

  // --- NEW LOGIC: PENDING/WAITLISTED Check & Redirection ---
  // If the user is logged in but their status is not ACTIVE, they cannot access profile pages.
  if (
    currentUser &&
    (currentUser.status === "PENDING" || currentUser.status === "WAITLISTED")
  ) {
    // Force redirect to the root page, where the client-side 'page.tsx'
    // will detect the PENDING status and display the ProfileCompletionModal.
    redirect("/");
  }

  // 2. Fetch the profile being viewed by username
  // We assume this function returns the full profile object (which includes role, displayname, etc.)
  const profileToView = await getUserDetails(resolvedParams.username);

  // --- Case 1: Profile not found (or inactive/blocked) ---
  if (!profileToView) {
    return <UserNotFound />;
  }

  // --- Case 2: Current user viewing own profile ---
  // The username in the URL matches the active profile's username from the session.
  if (currentUser && currentUser.username === profileToView.username) {
    return (
      <>
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="flex min-h-screen flex-col">
              <div className="max-w-7xl mx-auto p-5 flex w-full">
                {/* Assuming this Sidebar is for the admin/profile view */}
                <div className="hidden lg:block w-[280px] border-r border-gray-200 sticky top-0 h-full">
                  <Sidebar />
                </div>
                <main className="flex-1 min-w-0 px-4">
                  {/* FIX: Pass the fetched profile data to ProfileMain */}
                  <ProfileMain user={profileToView} />
                </main>
              </div>
              <div className="fixed sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
            </div>
          </div>
        </section>
      </>
    );
  }

  // --- Case 3: Viewing another user's profile (Public View) ---
  const user = profileToView; // Use the fetched data for the public view
  const roleStyle = getRoleStyle(user.role); // Get the dynamic style
  const imageSource = user.profilePicture || DEFAULT_PROFILE_PIC; // Determine image source

  return (
    <>
      {/* Outer container for full screen height and centering, adjusted spacing */}
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gray-50">
        {}
        <div
          className="
              w-full max-w-sm md:max-w-md 
              p-6 md:p-8 
              bg-white 
              rounded-xl shadow-2xl 
              flex flex-col items-center text-center
            "
        >
          {/* Circular Profile Picture (profiles.profilePicture) */}
          <div className="mb-4">
            {" "}
            {/* Reduced margin-bottom */}
            <img
              src={imageSource}
              alt={`${user.displayName}'s profile picture`}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md transition transform hover:scale-105 duration-300"
              // Fallback handled by 'imageSource' variable above
            />
          </div>

          {/* Display Name (profiles.displayName) */}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-0.5 tracking-tight">
            {" "}
            {/* Reduced margin-bottom */}
            {user.displayName}
          </h1>

          {/* Profile Handle / Username (profiles.username) */}
          <p className="text-base text-gray-500 font-medium mb-3">
            @{user.username}
          </p>

          {/* Role Badge (profiles.role) */}
          <span
            className={`
                uppercase text-xs font-bold px-3 py-1 
                rounded-full tracking-wider border-2 
                transition duration-200 ease-in-out
                ${roleStyle}
              `}
          >
            Role: {user.role}
          </span>

          {/* Bio (profiles.bio) */}
          {user.bio ? (
            <p className="mt-4 text-lg text-gray-700 leading-relaxed max-w-xs md:max-w-sm">
              {" "}
              {/* Reduced margin-top */}
              {user.bio}
            </p>
          ) : (
            <p className="mt-4 text-base text-gray-500 italic">
              {" "}
              {/* Reduced margin-top */}
              No bio provided yet.
            </p>
          )}

          {/* Removed the 'A public profile view.' text */}
        </div>
      </div>
    </>
  );
};

export default UserPage;
