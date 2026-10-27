import ProfileIdentity from "./ProfileIdentity";

type ProfileImageProps = {
  name: string;
  avatar?: string | null;
  photoUrl?: string | null;
  size?: "small" | "medium" | "large";
  className?: string;
};

export default function ProfileImage({
  name,
  avatar,
  photoUrl,
  size = "medium",
  className = "",
}: ProfileImageProps) {
  return (
    <span
      className={`profile-image profile-image-${size} ${className}`}
      aria-label={`${name} profile photo`}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" />
      ) : avatar ? (
        <ProfileIdentity identity={avatar} />
      ) : (
        <strong>{name.slice(0, 1).toUpperCase()}</strong>
      )}
    </span>
  );
}
