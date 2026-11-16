function findPicture(value, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return "";
  visited.add(value);

  const picture =
    value.profilePicture ??
    value.profilePictureUrl ??
    value.profileImage ??
    value.avatarUrl ??
    value.avatar ??
    value.photoUrl ??
    value.image;
  if (typeof picture === "string" && picture.trim()) return picture.trim();
  if (picture && typeof picture === "object") {
    const url =
      picture.url ??
      picture.secure_url ??
      picture.secureUrl ??
      picture.location ??
      picture.path ??
      picture.src ??
      picture.href;
    if (typeof url === "string" && url.trim()) return url.trim();
    const nestedPicture = findPicture(picture, visited);
    if (nestedPicture) return nestedPicture;
  }

  for (const key of ["profile", "user", "data", "result", "details"]) {
    const nestedPicture = findPicture(value[key], visited);
    if (nestedPicture) return nestedPicture;
  }
  return "";
}

export function getProfilePictureUrl(user) {
  return findPicture(user);
}
