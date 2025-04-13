
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  age: string;
  maritalStatus: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  age?: string;
  maritalStatus?: string;
}

export const useRegisterFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();

  const validateForm = (data: FormData): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Check required fields
    if (!data.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!data.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!data.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (!data.age) {
      newErrors.age = "Age is required";
      isValid = false;
    } else {
      const ageNum = parseInt(data.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
        newErrors.age = "Age must be between 18 and 120";
        isValid = false;
      }
    }

    if (!data.maritalStatus) {
      newErrors.maritalStatus = "Marital status is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
    }

    return isValid;
  };

  return { errors, validateForm };
};
