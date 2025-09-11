
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import PersonalInfoFields from "./register/PersonalInfoFields";
import AccountInfoFields from "./register/AccountInfoFields";
import LanguageAlert from "./register/LanguageAlert";
import TermsAndPrivacyText from "./register/TermsAndPrivacyText";
import { useRegisterFormValidation } from "@/hooks/useRegisterFormValidation";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const { errors, validateForm } = useRegisterFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      gender,
      age,
      maritalStatus
    };

    if (!validateForm(formData)) {
      return;
    }

    try {
      await signUp(
        email, 
        password, 
        { 
          full_name: `${firstName} ${lastName}`,
          gender: gender,
          age: parseInt(age),
          marital_status: maritalStatus
        } as any
      );
      toast({
        title: "Success",
        description: "Your account has been created. Please log in.",
      });
      navigate("/login");
    } catch (error) {
      // Error is already handled in the signUp function
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="social-card p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-social-blue">Create an Account</h1>
            <p className="text-social-textSecondary mt-2">
              Join Lovaville to connect with friends and share moments
            </p>
          </div>

          <LanguageAlert />

          <form onSubmit={handleSubmit} className="space-y-4">
            <PersonalInfoFields 
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              gender={gender}
              setGender={setGender}
              age={age}
              setAge={setAge}
              maritalStatus={maritalStatus}
              setMaritalStatus={setMaritalStatus}
              errors={errors}
            />

            <AccountInfoFields 
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              errors={errors}
            />

            <TermsAndPrivacyText />

            <Button
              type="submit"
              className="w-full bg-social-green hover:bg-green-600 text-white py-2 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-social-textSecondary">
              Already have an account?{" "}
              <Link to="/login" className="text-social-blue font-medium hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
