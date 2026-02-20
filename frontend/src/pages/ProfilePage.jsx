import { Camera, Loader2, Mail, User, CalendarDays, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to check if authUser is loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  if (isLoading && !authUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-base-200 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold">Profile</h1>
            <p className="text-base-content/70 mt-2">Manage your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImage || authUser?.profilePic || `https://ui-avatars.com/api/?background=1f2937&color=fff&name=${authUser?.fullName || 'User'}`}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-base-100"
              />
              <label
                htmlFor="profile-photo"
                className={`absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-primary-content cursor-pointer transition hover:scale-105 ${
                  isUpdatingProfile ? "pointer-events-none animate-pulse" : ""
                }`}
              >
                <Camera className="size-5" />
                <input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUpdatingProfile}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/70">
              {isUpdatingProfile ? "Uploading profile picture..." : "Click camera icon to upload a new photo"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-base-300 bg-base-100 p-4">
              <div className="text-sm text-base-content/60 mb-2 flex items-center gap-2">
                <User className="size-4" />
                Full Name
              </div>
              <p className="font-medium break-words">{authUser?.fullName || "Not available"}</p>
            </div>

            <div className="rounded-xl border border-base-300 bg-base-100 p-4">
              <div className="text-sm text-base-content/60 mb-2 flex items-center gap-2">
                <Mail className="size-4" />
                Email Address
              </div>
              <p className="font-medium break-all">{authUser?.email || "Not available"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-5 space-y-3">
            <h2 className="font-semibold text-lg">Account Information</h2>
            <div className="flex items-center justify-between text-sm py-2 border-b border-base-300">
              <span className="text-base-content/70 flex items-center gap-2">
                <CalendarDays className="size-4" />
                Member Since
              </span>
              <span className="font-medium">
                {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-base-content/70 flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Account Status
              </span>
              <span className="font-medium text-success">Active</span>
            </div>
          </div>

          {isUpdatingProfile ? (
            <div className="flex items-center justify-center gap-2 text-sm text-base-content/70">
              <Loader2 className="size-4 animate-spin" />
              Saving changes...
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;