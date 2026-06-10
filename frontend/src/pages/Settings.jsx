import { useEffect, useState } from "react";

import {
  getSettings,
  updateProfile,
  changePassword
} from "../api/settings.api";

import toast from "react-hot-toast";

export default function Settings() {

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    avatar: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchSettings =
      async () => {

        try {

          const res =
            await getSettings();

          if (res.data) {

            setProfile({
              name:
                res.data.name || "",

              phone:
                res.data.phone || "",

              avatar:
                res.data.avatar || ""
            });
          }

        } catch {

          toast.error(
            "Failed to load settings"
          );

        } finally {

          setLoading(false);

        }
      };

    fetchSettings();

  }, []);

  const handleProfileUpdate =
    async (e) => {

      e.preventDefault();

      try {

        await updateProfile(
          profile
        );

        toast.success(
          "Profile updated"
        );

      } catch {

        toast.error(
          "Profile update failed"
        );
      }
    };

  const handlePasswordChange =
    async (e) => {

      e.preventDefault();

      try {

        await changePassword(
          passwordData
        );

        toast.success(
          "Password changed"
        );

        setPasswordData({
          currentPassword: "",
          newPassword: ""
        });

      } catch {

        toast.error(
          "Password update failed"
        );
      }
    };

  if (loading) {

    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  return (

    <div>

      <div
        className="card"
        style={{
          marginBottom: 24
        }}
      >

        <h3>
          Profile Settings
        </h3>

        <form
          onSubmit={
            handleProfileUpdate
          }
        >

          <div
            style={{
              display: "grid",
              gap: 16
            }}
          >

            <input
              className="input"
              placeholder="Name"
              value={profile.name}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name:
                    e.target.value
                })
              }
            />

            <input
              className="input"
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  phone:
                    e.target.value
                })
              }
            />

            <input
              className="input"
              placeholder="Avatar URL"
              value={profile.avatar}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  avatar:
                    e.target.value
                })
              }
            />

            <button
              className="btn btn-primary"
            >
              Update Profile
            </button>

          </div>

        </form>

      </div>

      <div className="card">

        <h3>
          Change Password
        </h3>

        <form
          onSubmit={
            handlePasswordChange
          }
        >

          <div
            style={{
              display: "grid",
              gap: 16
            }}
          >

            <input
              type="password"
              className="input"
              placeholder="Current Password"
              value={
                passwordData.currentPassword
              }
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword:
                    e.target.value
                })
              }
            />

            <input
              type="password"
              className="input"
              placeholder="New Password"
              value={
                passwordData.newPassword
              }
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword:
                    e.target.value
                })
              }
            />

            <button
              className="btn btn-primary"
            >
              Change Password
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}