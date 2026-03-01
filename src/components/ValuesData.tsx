import React from "react";

export interface ValuesData {
  value: string;
  days: number;
}

interface ValuesInActionProps {
  mockValuesData?: ValuesData[];
}

const ValuesInAction = ({ mockValuesData = [] }: ValuesInActionProps) => {
  return (
    <div className="flex flex-col min-h-[320px] rounded-xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-foreground">Values in Action</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Days each value appeared (Last 30 days)
        </p>
      </div>

      {/* Content Area */}
      <div className="mt-8 flex flex-1 items-center justify-center">
        {mockValuesData.length === 0 ? (
          // Empty State Text
          <p className="text-sm text-muted-foreground">
            No values data yet. Start journaling!
          </p>
        ) : (
          // Dynamic Data List
          <div className="w-full text-center text-sm text-muted-foreground">
            {/* Jab API ready ho jaye, yahan apna list render karein */}
            [Values List Here]
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuesInAction;
