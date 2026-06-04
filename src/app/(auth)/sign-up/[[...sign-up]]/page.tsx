import { SignUp } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center"
      style={{
        backgroundImage: "url('/library.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div className="relative z-10">
        <SignUp
          appearance={{
            variables: {
            },
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
            },
            elements: {
            },
          }}
        />
      </div>
    </div>
  );
}