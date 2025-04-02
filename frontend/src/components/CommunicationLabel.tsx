type CommunicationLabelProps = { label: string };
export function CommunicationLabel({ label }: CommunicationLabelProps) {
  return (
    <div className="isolate rounded bg-gray-600 p-2 opacity-80">{label}</div>
  );
}
