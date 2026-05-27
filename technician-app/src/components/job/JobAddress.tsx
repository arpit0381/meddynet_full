import { MapPin } from 'lucide-react';

interface JobAddressProps {
  address: string;
}

export const JobAddress = ({ address }: JobAddressProps) => {
  return (
    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
        <MapPin className="text-orange-600 w-4 h-4" />
      </div>
      <p className="text-sm text-gray-700 font-medium leading-relaxed">{address}</p>
    </div>
  );
};
