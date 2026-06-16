import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface ProfileCompletionModalProps {
  userId: string;
  onComplete: () => void;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  userId,
  onComplete,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExistingActive, setIsExistingActive] = useState<boolean | null>(null);

  useEffect(() => {
    // Prefill if data exists
    supabase
      .from("profiles")
      .select("first_name, last_name, phone, is_active")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setPhone(data.phone || "");
          if (data.is_active !== undefined) {
            setIsExistingActive(data.is_active);
          }
        }
      });
  }, [userId]);

  const handleSave = async () => {
    if (!firstName.trim() || !phone.trim()) {
      setError("First name and phone number are required");
      return;
    }

    setError("");
    setLoading(true);

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: userId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      updated_at: new Date().toISOString(),
      ...(isExistingActive === null || isExistingActive === undefined ? { is_active: false } : {}),
    });

    setLoading(false);

    if (!dbError) {
      onComplete();
    } else {
      console.error("Error saving profile:", dbError.message);
      setError("Failed to save profile. Please try again.");
    }
  };

  const isDisabled =
    loading || !firstName.trim() || !phone.trim();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative">
        <h2 className="text-2xl font-bold text-center mb-4">
          Complete Your Profile
        </h2>

        <input
          type="text"
          placeholder="First Name *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border rounded-md p-2 mb-3"
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border rounded-md p-2 mb-3"
        />

        <input
          type="tel"
          placeholder="Phone Number *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-md p-2 mb-3"
        />

        {error && (
          <p className="text-sm text-red-500 mb-3 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={isDisabled}
          className="w-full bg-blue-500 text-white py-2 rounded-md
                     hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
