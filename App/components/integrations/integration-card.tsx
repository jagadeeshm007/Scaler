'use client';

import { Loader2, Plug, Unplug } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useConnectIntegration,
  useDisconnectIntegration,
} from '@/hooks/mutations/use-settings-mutations';
import { cn } from '@/lib/utils';
import type { Integration } from '@/types';

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();
  const isPending = connect.isPending || disconnect.isPending;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5',
        integration.is_connected && 'border-green-500/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-800">
            <Plug className="size-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
            <p className="text-xs text-neutral-500">{integration.category}</p>
          </div>
        </div>
        {integration.is_connected && (
          <Badge className="bg-green-500/10 text-green-500">Connected</Badge>
        )}
      </div>

      {integration.description && (
        <p className="text-sm text-neutral-400">{integration.description}</p>
      )}

      <div className="mt-auto">
        {integration.is_connected ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => disconnect.mutate(integration.slug)}
            disabled={isPending}
          >
            {disconnect.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Unplug className="size-4" />
            )}
            Disconnect
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => connect.mutate(integration.slug)}
            disabled={isPending}
          >
            {connect.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plug className="size-4" />
            )}
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
