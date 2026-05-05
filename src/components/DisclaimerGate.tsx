import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const DisclaimerGate = ({ onContinue }: { onContinue: () => void }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8 md:p-10 shadow-lg flex flex-col gap-6">
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-foreground text-center">
          Welcome to Springfest 2026
        </h1>

        <div className="min-h-[160px] rounded-md border border-border bg-background/50 p-4 text-tertiary text-sm whitespace-pre-wrap">
          {/* Text to be added */}
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
