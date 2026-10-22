import { DevicePreview } from "@/components/device-preview";
import { RadioApp } from "@/radio";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <DevicePreview>
        <RadioApp />
      </DevicePreview>
    </main>
  );
}
