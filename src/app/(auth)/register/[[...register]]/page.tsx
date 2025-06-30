import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 pt-8 sm:p-6 sm:pt-16 lg:p-8 lg:pt-36">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Logo and branding section */}
        <div className="mb-4 text-center sm:mb-6 lg:mb-8">
          <div className="flex justify-center">
            <Image
              src="/bookify-logo.png"
              alt="Bookify Logo"
              width={160}
              height={160}
              className="size-24 sm:size-32 lg:size-36 xl:size-40"
            />
          </div>
        </div>

        {/* Sign up component with custom styling container */}
        <div className="flex justify-center">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#1e293b",
                colorBackground: "#ffffff",
                colorInputBackground: "#f8fafc",
                colorInputText: "#0f172a",
                colorText: "#1e293b",
                colorTextSecondary: "#64748b",
                colorSuccess: "#10b981",
                colorDanger: "#dc2626",
                colorWarning: "#f59e0b",
                borderRadius: "0.625rem",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "0.875rem",
                fontWeight: {
                  normal: "400",
                  medium: "500",
                  semibold: "600",
                  bold: "700",
                },
              },
              elements: {
                rootBox: "mx-auto shadow-2xl",
                card: "bg-card/95 backdrop-blur-sm border-0 shadow-xl rounded-xl overflow-hidden",
                headerTitle: "text-xl font-semibold text-card-foreground",
                headerSubtitle: "text-sm text-muted-foreground",
                socialButtonsBlockButton:
                  "bg-card border border-border text-foreground hover:bg-accent hover:border-accent-foreground/20 hover:text-white transition-all duration-200 rounded-lg font-medium shadow-sm",
                socialButtonsBlockButtonText:
                  "font-medium transition-colors duration-200",
                dividerLine:
                  "bg-gradient-to-r from-transparent via-border to-transparent",
                dividerText: "text-muted-foreground font-medium",
                footerActionText: "text-muted-foreground",
                footerActionLink:
                  "text-primary hover:text-primary/80 font-semibold transition-colors duration-200",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton:
                  "text-primary hover:text-primary/80 transition-colors duration-200",
                formResendCodeLink:
                  "text-primary hover:text-primary/80 font-medium transition-colors duration-200",
                otpCodeFieldInput:
                  "border-border rounded-lg text-center font-mono font-semibold text-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200",
                alertText: "text-sm",
                formFieldErrorText: "text-destructive text-sm mt-1",
                formFieldSuccessText: "text-green-600 text-sm mt-1",
                formFieldAction:
                  "text-primary hover:text-primary/80 font-medium transition-colors duration-200",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
                termsPageUrl: "/terms",
                privacyPageUrl: "/privacy",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
