const fs = require('fs');
const path = require('path');

function fixColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const replacements = {
    'bg-neutral-950': 'bg-background',
    'bg-neutral-900': 'bg-popover',
    'bg-neutral-850': 'bg-accent/80',
    'bg-neutral-800': 'bg-accent',
    'border-neutral-950': 'border-background',
    'border-neutral-800': 'border-border',
    'border-neutral-700': 'border-border',
    'text-white': 'text-foreground',
    'text-neutral-200': 'text-popover-foreground',
    'text-neutral-400': 'text-muted-foreground',
    'text-neutral-500': 'text-muted-foreground',
    'text-neutral-700': 'text-muted-foreground',
    'bg-black': 'bg-background',
    'border-white': 'border-foreground',
    'bg-accent/50': 'bg-accent/50', // Ignore
  };

  for (const [oldClass, newClass] of Object.entries(replacements)) {
    // We use a global regex with word boundaries to replace these classes safely
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    content = content.replace(regex, newClass);
  }

  // A couple of manual tweaks for border dividers
  content = content.replace(/className="my-2 h-px bg-accent"/g, 'className="my-2 h-px bg-border"');
  content = content.replace(/className="bg-accent"/g, 'className="bg-border"'); // For DropdownMenuSeparator

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed colors in ${filePath}`);
}

fixColors('./App/components/layout/user-avatar-dropdown.tsx');
