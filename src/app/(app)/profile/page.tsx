import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <UserProfile />
    </div>
  );
}
