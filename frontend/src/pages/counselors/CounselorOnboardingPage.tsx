import CounselorProfileProgress from "@/components/counselors/onboarding/CounselorProfileProgress";
import CounselorDocumentsSection from "@/components/counselors/onboarding/CounselorDocumentsSection";
import CounselorBioForm from "@/components/counselors/onboarding/CounselorBioForm";

const CounselorOnboardingPage = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Complete your counselor profile</h2>
      <p className="text-muted-foreground">
        Upload your credentials, share your experience, and set up your availability to start receiving student bookings.
      </p>
    </div>
    <CounselorProfileProgress />
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <CounselorBioForm />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <CounselorDocumentsSection />
      </div>
    </div>
  </div>
);

export default CounselorOnboardingPage;