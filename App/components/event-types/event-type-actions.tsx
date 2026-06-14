'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarSearch,
  Code2,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EventTypeActiveToggle } from '@/components/event-types/event-type-active-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  useCreateEventType,
  useDeleteEventType,
  useUpdateEventType,
} from '@/hooks/mutations/use-event-type-mutations';
import { useEventTypes } from '@/hooks/queries/use-event-types';
import { slugify } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types';

interface EventTypeActionsProps {
  eventTypeId: string;
  slug: string;
  username: string;
  eventType: EventType;
  variant: 'desktop' | 'mobile';
  onDelete?: () => void;
}

function MobileSheetItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm transition-colors hover:bg-accent',
        destructive ? 'text-red-500' : 'text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  );
}

export function EventTypeActions({
  eventTypeId,
  slug,
  username,
  eventType,
  variant,
  onDelete,
}: EventTypeActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: eventTypes } = useEventTypes();
  const deleteMutation = useDeleteEventType();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();

  const fullEventType = eventTypes?.find((item) => item.id === eventTypeId) ?? eventType;
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${ROUTES.publicBooking(username, slug)}`;
  const profileToggleLabel = fullEventType.is_hidden ? 'Show on profile' : 'Hide from profile';

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
    setMenuOpen(false);
  };

  const handleDuplicate = () => {
    createMutation.mutate(
      {
        title: `${fullEventType.title} (copy)`,
        slug: slugify(`${fullEventType.slug}-copy`),
        description: fullEventType.description,
        duration_mins: fullEventType.duration_mins,
        duration_options: fullEventType.duration_options,
        location_type: fullEventType.location_type,
        location_details: fullEventType.location_details,
        is_hidden: fullEventType.is_hidden,
      },
      {
        onSuccess: (created) => {
          setMenuOpen(false);
          router.push(ROUTES.eventTypeEdit(created.id));
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(eventTypeId, {
      onSuccess: () => {
        setDeleteOpen(false);
        setMenuOpen(false);
        onDelete?.();
      },
    });
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          aria-label="Event type actions"
          onClick={() => setMenuOpen(true)}
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors hover:bg-accent/80 hover:text-card-foreground"
        >
          <MoreHorizontal className="size-4" />
        </button>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="rounded-t-2xl border-border bg-card px-4 pt-3 pb-8"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-neutral-600" />
            <SheetHeader className="sr-only">
              <SheetTitle>Event type actions</SheetTitle>
            </SheetHeader>
            <div className="space-y-1">
              <MobileSheetItem
                icon={ExternalLink}
                label="Preview"
                onClick={() => {
                  window.open(publicUrl, '_blank');
                  setMenuOpen(false);
                }}
              />
              <MobileSheetItem
                icon={Copy}
                label="Copy link to event"
                onClick={() => void copyLink()}
              />
              <MobileSheetItem
                icon={CalendarSearch}
                label="Troubleshoot"
                onClick={() => setMenuOpen(false)}
              />
              <MobileSheetItem
                icon={Pencil}
                label="Edit"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(ROUTES.eventTypeEdit(eventTypeId));
                }}
              />
              <MobileSheetItem icon={Copy} label="Duplicate" onClick={handleDuplicate} />
              <div className="flex items-center justify-between rounded-lg px-2 py-3">
                <span className="text-sm text-foreground">{profileToggleLabel}</span>
                <EventTypeActiveToggle
                  checked={!fullEventType.is_hidden}
                  disabled={updateMutation.isPending}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate({ id: eventTypeId, data: { is_hidden: !checked } })
                  }
                />
              </div>
              <Separator className="my-2 bg-accent" />
              <MobileSheetItem
                icon={Trash2}
                label="Delete"
                destructive
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete event type"
          description={`Are you sure you want to delete "${slug}"? This action cannot be undone.`}
          confirmLabel="Delete"
          destructive
          loading={deleteMutation.isPending}
          onConfirm={handleDelete}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Event type actions"
            className="flex h-7 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-card-foreground"
          >
            <MoreHorizontal className="size-[15px] stroke-[1.75]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 rounded-xl border-border bg-card p-1.5 shadow-xl"
        >
          <DropdownMenuItem asChild>
            <Link href={ROUTES.eventTypeEdit(eventTypeId)} className="cursor-pointer">
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={createMutation.isPending}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info('Embed coming soon')}>
            <Code2 className="size-4" />
            Embed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info('Troubleshoot coming soon')}>
            <CalendarSearch className="size-4" />
            Troubleshoot
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-accent" />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete event type"
        description={`Are you sure you want to delete "${slug}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
