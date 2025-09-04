import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface GenderSelectorProps {
  gender?: string;
  onGenderChange: (gender: string) => void;
}

const genderOptions = [
  { value: "Man", label: "Man" },
  { value: "Woman", label: "Woman" },
  { value: "Trans man", label: "Trans man" },
  { value: "Trans woman", label: "Trans woman" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Genderfluid", label: "Genderfluid" },
  { value: "Agender", label: "Agender" },
  { value: "Genderqueer", label: "Genderqueer" },
  { value: "Trav (Male Cross-Dresser)", label: "Trav (Male Cross-Dresser)" },
];

const GenderSelector = ({ gender, onGenderChange }: GenderSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gender</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={gender || ""} 
          onValueChange={onGenderChange}
          className="grid grid-cols-2 gap-3"
        >
          {genderOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value} 
                id={`gender-${option.value}`}
                className="text-primary"
              />
              <Label 
                htmlFor={`gender-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default GenderSelector;