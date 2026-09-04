export type AppRole = "admin" | "staff" | "customer"

export function getDashboardPath(role: unknown) {
  switch (String(role).toLowerCase()) {
    case "admin":
      return "/admin"
    case "staff":
      return "/staff"
    default:
      return "/customer"
  }
}