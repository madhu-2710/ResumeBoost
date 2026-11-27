import flagsmith from "@flagsmith/flagsmith";
import { FlagsmithProvider, useExperiment } from "@flagsmith/flagsmith/react";
import ResumeUpload from "./components/ResumeUpload";

// Create a unique ID for each visitor and keep it in the browser.
function getVisitorId() {
  let visitorId = localStorage.getItem("resumeboost_visitor_id");

  if (!visitorId) {
    visitorId = "visitor_" + crypto.randomUUID();
    localStorage.setItem("resumeboost_visitor_id", visitorId);
  }

  return visitorId;
}

function HomePage() {
  const experimentFlag = useExperiment("resume_feedback_experience");

const feedbackExperience = experimentFlag?.value ?? "loading";

  return <ResumeUpload feedbackExperience={feedbackExperience} />;
}

export default function App() {
  const visitorId = getVisitorId();

  return (
    <FlagsmithProvider
      options={{
        environmentID: "8rQyjrLChnSD3b9KZCwYAX",
        identity: visitorId,
        enableEvents: true,
      }}
      flagsmith={flagsmith}
    >
      <HomePage />
    </FlagsmithProvider>
  );
}
