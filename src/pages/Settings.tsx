
import MainLayout from "@/components/layout/MainLayout";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsTabs from "@/components/settings/SettingsTabs";

const Settings = () => {
  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <SettingsHeader />
        <SettingsTabs />
      </div>
    </MainLayout>
  );
};

export default Settings;
