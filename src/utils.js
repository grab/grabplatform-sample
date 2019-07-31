export function environment() {
  return process.env.REACT_APP_NODE_ENV === "production" ||
    process.env.NODE_ENV === "production"
    ? "production"
    : "development";
}

export function requireAllValid(args) {
  if (typeof args === "object" && !!Object.keys(args).length) {
    Object.entries(args).forEach(([key, value]) => {
      if (value === null || value === undefined || !requireAllValid(value)) {
        throw new Error(`Invalid ${key}: ${undefined}`);
      }
    });
  }

  return args;
}
