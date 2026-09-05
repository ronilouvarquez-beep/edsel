import { SignupForm } from "@/components/signup-form"

export default function Page() {
  return (
    <div className="login-grid-background relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10">
      <div className="login-grid-lines" aria-hidden="true">
        <span className="login-grid-light login-grid-light-one" />
        <span className="login-grid-light login-grid-light-two" />
        <span className="login-grid-light login-grid-light-three" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
