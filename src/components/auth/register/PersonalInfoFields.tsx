
import { useState } from "react";
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
  setMaritalStatus
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
            className="social-input"
          />
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
            className="social-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={gender} onValueChange={setGender} required>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="non-binary">Non-binary</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
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
          className="social-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maritalStatus">Marital Status</Label>
        <Select value={maritalStatus} onValueChange={setMaritalStatus} required>
          <SelectTrigger id="maritalStatus">
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
      </div>
    </>
  );
};

export default PersonalInfoFields;
