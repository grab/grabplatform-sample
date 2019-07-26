export function environment() {
  return process.env.REACT_APP_NODE_ENV === "production" ||
    process.env.NODE_ENV === "production"
    ? "production"
    : "development";
}
