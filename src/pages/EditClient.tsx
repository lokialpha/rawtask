import { MobileLayout } from '@/components/layout/MobileLayout';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Client } from '@/types';

const colorOptions: { key: Client['color']; label: string; bg: string; dot: string }[] = [
  { key: 'blue', label: 'Blue', bg: 'bg-client-blue/20', dot: 'bg-client-blue' },
  { key: 'purple', label: 'Purple', bg: 'bg-client-purple/20', dot: 'bg-client-purple' },
  { key: 'pink', label: 'Pink', bg: 'bg-client-pink/20', dot: 'bg-client-pink' },
  { key: 'teal', label: 'Teal', bg: 'bg-client-teal/20', dot: 'bg-client-teal' },
  { key: 'orange', label: 'Orange', bg: 'bg-client-orange/20', dot: 'bg-client-orange' },
];

export default function EditClient() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { clients } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState<Client['color']>('blue');

  useEffect(() => {
    if (id) {
      const client = clients.getClient(id);
      if (client) {
        setName(client.name);
        setColor(client.color);
      } else {
        toast.error('Client not found');
        navigate('/clients');
      }
    }
  }, [id, clients, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Please enter a client name');
      return;
    }
    
    if (trimmedName.length > 50) {
      toast.error('Client name must be less than 50 characters');
      return;
    }

    if (id) {
      clients.updateClient(id, {
        name: trimmedName,
        color,
      });
      
      toast.success('Client updated successfully!');
      navigate('/clients');
    }
  };

  return (
    <MobileLayout showFab={false}>
      <header className="px-5 pt-6 pb-4 safe-top flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Edit Client</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-6">
        {/* Name */}
        <div>
          <label className="text-sm font-medium mb-2 block">Client Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter client name"
            maxLength={50}
            className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">{name.length}/50 characters</p>
        </div>

        {/* Color Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">Client Color</label>
          <div className="grid grid-cols-5 gap-3">
            {colorOptions.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setColor(option.key)}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all",
                  color === option.key
                    ? `${option.bg} border-current`
                    : "border-border bg-card"
                )}
                style={color === option.key ? { borderColor: `hsl(var(--client-${option.key}))` } : undefined}
              >
                <span
                  className={cn("w-6 h-6 rounded-full", option.dot)}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1">
            {colorOptions.map(option => (
              <span
                key={option.key}
                className={cn(
                  "text-2xs",
                  color === option.key ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="text-sm font-medium mb-3 block">Preview</label>
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  colorOptions.find(c => c.key === color)?.bg
                )}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: `hsl(var(--client-${color}))` }}
                >
                  {name.trim().charAt(0).toUpperCase() || 'C'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">
                    {name.trim() || 'Client Name'}
                  </h3>
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      colorOptions.find(c => c.key === color)?.dot
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Editing client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-14 gradient-primary rounded-2xl text-primary-foreground font-semibold shadow-primary active:scale-[0.98] transition-transform"
        >
          Save Changes
        </button>
      </form>
    </MobileLayout>
  );
}
