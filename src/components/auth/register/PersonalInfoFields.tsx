
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalInfoFieldsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  maritalStatus: string;
  setMaritalStatus: (value: string) => void;
  errors?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    age?: string;
    maritalStatus?: string;
  };
}

const PersonalInfoFields = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  gender,
  setGender,
  age,
  setAge,
  maritalStatus,
  setMaritalStatus,
  errors = {}
}: PersonalInfoFieldsProps) => {
  return (
    <>
      <div className="flex gap-4">
        <div className="space-y-2 w-1/2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={`social-input ${errors.firstName ? "border-red-500" : ""}`}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2 w-1/2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className={`social-input ${errors.lastName ? "border-red-500" : ""}`}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={gender} onValueChange={setGender} required>
          <SelectTrigger id="gender" className={errors.gender ? "border-red-500" : ""}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Man">Man</SelectItem>
            <SelectItem value="Woman">Woman</SelectItem>
            <SelectItem value="Trans man">Trans man</SelectItem>
            <SelectItem value="Trans woman">Trans woman</SelectItem>
            <SelectItem value="Non-binary">Non-binary</SelectItem>
            <SelectItem value="Genderfluid">Genderfluid</SelectItem>
            <SelectItem value="Agender">Agender</SelectItem>
            <SelectItem value="Genderqueer">Genderqueer</SelectItem>
            <SelectItem value="Trav (Male Cross-Dresser)">Trav (Male Cross-Dresser)</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          min="18"
          max="120"
          placeholder="30"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          className={`social-input ${errors.age ? "border-red-500" : ""}`}
        />
        {errors.age && (
          <p className="text-sm text-red-500 mt-1">{errors.age}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maritalStatus">Marital Status</Label>
        <Select value={maritalStatus} onValueChange={setMaritalStatus} required>
          <SelectTrigger id="maritalStatus" className={errors.maritalStatus ? "border-red-500" : ""}>
            <SelectValue placeholder="Select marital status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
            <SelectItem value="divorced">Divorced</SelectItem>
            <SelectItem value="widowed">Widowed</SelectItem>
            <SelectItem value="complicated">It's complicated</SelectItem>
          </SelectContent>
        </Select>
        {errors.maritalStatus && (
          <p className="text-sm text-red-500 mt-1">{errors.maritalStatus}</p>
        )}
      </div>
    </>
  );
};

export default PersonalInfoFields;
