export function getProfilePictureUrl(user) {
  const picture =
    user?.profilePicture ??
    user?.profilePictureUrl ??
    user?.avatar ??
    user?.photoUrl;

  if (typeof picture === "string") return picture;
  if (picture && typeof picture === "object") {
    return (
      picture.url ??
      picture.secure_url ??
      picture.location ??
      picture.path ??
      picture.src ??
      ""
    );
  }
  return "";
}
