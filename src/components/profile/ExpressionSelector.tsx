import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ExpressionSelectorProps {
  expression?: string;
  onExpressionChange: (expression: string) => void;
}

const expressionOptions = [
  { value: "Masculine-presenting", label: "Masculine-presenting" },
  { value: "Feminine-presenting", label: "Feminine-presenting" },
  { value: "Androgynous", label: "Androgynous" },
  { value: "Fluid / Varies", label: "Fluid / Varies" },
  { value: "Butch", label: "Butch" },
  { value: "Femme", label: "Femme" },
  { value: "Tomboy", label: "Tomboy" },
  { value: "Soft-masc / Soft-femme", label: "Soft-masc / Soft-femme" },
  { value: "Drag queen", label: "Drag queen" },
  { value: "Drag king", label: "Drag king" },
  { value: "Cross-dresser", label: "Cross-dresser" },
];

const ExpressionSelector = ({ expression, onExpressionChange }: ExpressionSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Expression</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={expression || ""} 
          onValueChange={onExpressionChange}
          className="grid grid-cols-2 gap-3"
        >
          {expressionOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value} 
                id={`expression-${option.value}`}
                className="text-primary"
              />
              <Label 
                htmlFor={`expression-${option.value}`}
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

export default ExpressionSelector;