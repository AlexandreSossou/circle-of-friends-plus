
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";

interface AccountInfoFieldsProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  errors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

const AccountInfoFields = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors = {}
}: AccountInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`social-input ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && (
          <FormMessage>{errors.email}</FormMessage>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`social-input ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && (
          <FormMessage>{errors.password}</FormMessage>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={`social-input ${errors.confirmPassword ? "border-red-500" : ""}`}
        />
        {errors.confirmPassword && (
          <FormMessage>{errors.confirmPassword}</FormMessage>
        )}
      </div>
    </>
  );
};

export default AccountInfoFields;
