import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SexualOrientationSelectorProps {
  sexualOrientation?: string;
  onSexualOrientationChange: (orientation: string) => void;
}

const orientationOptions = [
  { value: "Heterosexual", label: "Heterosexual" },
  { value: "Homosexual", label: "Homosexual" },
  { value: "Bisexual", label: "Bisexual" },
  { value: "Pansexual", label: "Pansexual" },
  { value: "Asexual", label: "Asexual" },
  { value: "Demisexual", label: "Demisexual" },
  { value: "Prefer not to say", label: "Prefer not to say" },
  { value: "Other", label: "Other" },
];

const SexualOrientationSelector = ({ sexualOrientation, onSexualOrientationChange }: SexualOrientationSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sexual Orientation</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={sexualOrientation || ""} 
          onValueChange={onSexualOrientationChange}
          className="grid grid-cols-2 gap-3"
        >
          {orientationOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value} 
                id={`orientation-${option.value}`}
                className="text-primary"
              />
              <Label 
                htmlFor={`orientation-${option.value}`}
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

export default SexualOrientationSelector;