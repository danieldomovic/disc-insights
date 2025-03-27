import { colorProfiles, ColorType } from "@/lib/colorProfiles";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Sun, Leaf, Droplets } from "lucide-react";

interface ColorProfileProps {
  color: ColorType;
}

// Map color types to their corresponding icons
const colorIcons = {
  "fiery-red": Flame,
  "sunshine-yellow": Sun,
  "earth-green": Leaf,
  "cool-blue": Droplets
};

export function ColorProfile({ color }: ColorProfileProps) {
  const profile = colorProfiles[color];
  const IconComponent = colorIcons[color];
  
  return (
    <div 
      className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{ 
        backgroundColor: `${profile.bgColor}15`, // Light version of the color with opacity
        borderLeft: `4px solid ${profile.bgColor}`
      }}
    >
      <div className="flex flex-col items-center text-center mb-4">
        <div 
          className="w-20 h-20 rounded-2xl mb-4 flex items-center justify-center"
          style={{ backgroundColor: profile.bgColor }}
        >
          <IconComponent size={40} color={profile.textColor} />
        </div>
        <h3 className="text-2xl font-bold">{profile.name}</h3>
      </div>
      <p className="text-center">{profile.description}</p>
    </div>
  );
}

interface ColorProfileDetailProps {
  color: ColorType;
}

export function ColorProfileDetail({ color }: ColorProfileDetailProps) {
  const profile = colorProfiles[color];
  const IconComponent = colorIcons[color];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div 
            className="w-12 h-12 rounded-lg mr-4 flex items-center justify-center" 
            style={{ backgroundColor: profile.bgColor }}
          >
            <IconComponent size={24} color={profile.textColor} />
          </div>
          <h3 className="text-xl font-semibold">{profile.name}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold">Appears:</p>
              <p className="text-sm">{profile.appears}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold">Wants to be:</p>
              <p className="text-sm">{profile.wantsToBe}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold">Primary focus:</p>
              <p className="text-sm">{profile.primaryFocus}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold">Likes YOU to be:</p>
              <p className="text-sm">{profile.likesYouToBe}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold">Fears:</p>
              <p className="text-sm">{profile.fears}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold">Can be irritated by:</p>
              <p className="text-sm">{profile.canBeIrritatedBy}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold">Under pressure may:</p>
              <p className="text-sm">{profile.underPressureMay}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold">Decisions are:</p>
              <p className="text-sm">{profile.decisionsAre}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
