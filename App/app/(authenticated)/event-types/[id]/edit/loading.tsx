import { Loader } from '@/components/ui/loader';

export default function EditEventTypeLoading() {
  return (
    <div className="flex flex-1 min-h-[85vh] w-full items-center justify-center">
      <Loader variant="grid" className="text-primary" />
    </div>
  );
}
