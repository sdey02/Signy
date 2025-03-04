import { Button } from "@/components/ui/button";

// Sample label data - in a real app, this would come from an API or state management
const SAMPLE_LABELS = [
  { id: 1, name: "Signature", color: "#EDB5B5", icon: "✍️" },
  { id: 2, name: "Date", color: "#B5EDCC", icon: "📆" },
  { id: 3, name: "Name", color: "#B5C8ED", icon: "👤" },
  { id: 4, name: "Initial", color: "#EDD5B5", icon: "🖋️" },
  { id: 5, name: "Address", color: "#D5B5ED", icon: "🏠" },
  { id: 6, name: "Email", color: "#B5EDE2", icon: "📧" },
  { id: 7, name: "Phone", color: "#E2B5ED", icon: "📱" },
  { id: 8, name: "Company", color: "#EDB5C8", icon: "🏢" }
];

interface LabelsPanelProps {
  onLabelSelect: (label: any) => void;
}

export default function LabelsPanel({ onLabelSelect }: LabelsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="py-4 text-center border-b border-[#333] flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-300">Labels</h3>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto py-3">
        {/* Vertical list of label buttons */}
        {SAMPLE_LABELS.map((label) => (
          <button
            key={label.id}
            onClick={() => onLabelSelect(label)}
            className="flex items-center p-3 mx-3 mb-3 rounded-md bg-[#2A2A2A] hover:bg-[#333] text-left w-[calc(100%-24px)]"
            style={{ borderLeft: `4px solid ${label.color}` }}
            title={label.name}
          >
            <span className="text-2xl mr-3">{label.icon}</span>
            <span className="text-sm font-medium">{label.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 