
import { Link } from "react-router-dom";

const TermsAndPrivacyText = () => {
  return (
    <div className="text-sm text-social-textSecondary">
      By registering, you agree to our{" "}
      <Link to="/terms" className="text-social-blue hover:underline">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link to="/privacy" className="text-social-blue hover:underline">
        Privacy Policy
      </Link>
      .
    </div>
  );
};

export default TermsAndPrivacyText;
