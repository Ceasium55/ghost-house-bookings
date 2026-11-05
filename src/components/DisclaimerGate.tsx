import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const DisclaimerGate = ({ onContinue }: { onContinue: () => void }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8 md:p-10 shadow-lg flex flex-col gap-6 my-auto">
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-foreground text-center">
          Welcome to Springfest 2026
        </h1>

        <div className="max-h-[55vh] overflow-y-auto rounded-md border border-border bg-background/50 p-4 text-tertiary text-sm space-y-3">
          <p className="text-foreground font-semibold">Welcome to the Springfest Reservation website</p>
          <p>This page is part of a student-led project for Springfest. To take part in the Haunted House, Escape Room, and Chess tournament activities, you will need to book a reservation through this site.</p>
          <p>Before you do so, please take a moment to read how your data is handled.</p>

          <p className="text-foreground font-semibold">What we record about your reservation:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The number of people in your group</li>
            <li>A randomly generated 8-digit reservation number (to be show on entry to a member of IT or activity staff)</li>
          </ul>

          <p>We do not collect your name, email, phone number, or any other personal detail. Your reservation data is processed as part of the School's public-interest mission of organising educational and school activities, including managing crowd flow and access to limited-capacity activities during Springfest (Article 6(1)(e) GDPR).</p>

          <p><span className="text-foreground font-semibold">Technical information:</span> As with most websites, ours automatically records your IP address, device and browser type, and basic access logs (such as time of visit). This technical information is needed for security and traffic monitoring, on the basis of the School's duty in keeping its IT systems secure.</p>

          <p><span className="text-foreground font-semibold">Where the data is stored:</span> The website is hosted on the school's own infrastructure. Reservation data, technical logs, and authentication are all managed by the School and Springfest IT team. The data stays under the School's control and is not shared with external cloud providers or third parties.</p>

          <p><span className="text-foreground font-semibold">Retention:</span> All data is automatically deleted on (Springfest end date).</p>

          <p><span className="text-foreground font-semibold">Your rights:</span> You have the right to request access to and rectification or erasure of your personal data or restriction of the processing or to object to the processing. You also have the right to lodge a complaint with the Data protection authority. To exercise your rights or for further information about data privacy, please contact the school's DPO at: <a href="mailto:ixl-dpo-correspondent@eursc.eu" className="text-secondary underline">ixl-dpo-correspondent@eursc.eu</a>. More details about your rights and how the School collects, uses and discloses your personal data can be found in its full Privacy statement: <a href="https://www.eeb3.eu/app/uploads/2022/07/2018-06-D-21-en-5-European-School-Privacy-Statement-EN.pdf" target="_blank" rel="noopener noreferrer" className="text-secondary underline break-all">https://www.eeb3.eu/app/uploads/2022/07/2018-06-D-21-en-5-European-School-Privacy-Statement-EN.pdf</a>.</p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
          />
          <span className="text-foreground text-base">
            I understand - continue to reservations
          </span>
        </label>

        <Button
          disabled={!accepted}
          onClick={onContinue}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default DisclaimerGate;
