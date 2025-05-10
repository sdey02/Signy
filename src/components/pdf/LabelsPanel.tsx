import { Button } from "@/components/ui/button";

// Sample label data - in a real app, this would come from an API or state management
const SAMPLE_LABELS = [
  { id: 1, name: "Signature", type: "Signature", color: "#EDB5B5", icon: "✍️" },
  { id: 2, name: "Date", type: "Date", color: "#B5EDCC", icon: "📆" },
  { id: 3, name: "Name", type: "Name", color: "#B5C8ED", icon: "👤" },
  { id: 4, name: "Initial", type: "Initial", color: "#EDD5B5", icon: "🖋️" },
  { id: 5, name: "Address", type: "Address", color: "#D5B5ED", icon: "🏠" },
  { id: 6, name: "Email", type: "Email", color: "#B5EDE2", icon: "📧" },
  { id: 7, name: "Phone", type: "Phone", color: "#E2B5ED", icon: "📱" },
  { id: 8, name: "Company", type: "Company", color: "#EDB5C8", icon: "🏢" }
];

interface LabelsPanelProps {
  onLabelSelect: (label: {type: string, color: string, icon: string} | undefined) => void;
}

export default function LabelsPanel({ onLabelSelect }: LabelsPanelProps) {
  console.log("Rendering LabelsPanel");
  
  const handleLabelClick = (label: any) => {
    // Format the label data correctly
    console.log("Label clicked in panel:", label);
    onLabelSelect({
      type: label.type,
      color: label.color,
      icon: label.icon
    });
  };
  
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
            onClick={() => handleLabelClick(label)}
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