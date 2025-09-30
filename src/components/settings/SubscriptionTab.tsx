import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, Calendar } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SubscriptionTab = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.subscription.currentPlan")}</CardTitle>
          <CardDescription>{t("settings.subscription.planDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Free Plan</h3>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Basic features with limited access
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Current plan includes:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>1 post per day</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Basic profile features</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Limited group access</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.subscription.upgradePlan")}</CardTitle>
          <CardDescription>{t("settings.subscription.upgradeDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Premium
                  <Badge>Popular</Badge>
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Unlimited posts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Advanced profile features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Create unlimited groups</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </div>
                </div>
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">$19.99</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Everything in Premium</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Verified badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Custom profile URL</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.subscription.billingHistory")}</CardTitle>
          <CardDescription>View your past transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No billing history available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your transactions will appear here once you subscribe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTab;
