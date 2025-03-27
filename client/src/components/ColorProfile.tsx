import { colorProfiles, ColorType } from "@/lib/colorProfiles";
import { Card, CardContent } from "@/components/ui/card";

interface ColorProfileProps {
  color: ColorType;
}

export function ColorProfile({ color }: ColorProfileProps) {
  const profile = colorProfiles[color];
  
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div 
          className="w-12 h-12 rounded-full mr-4" 
          style={{ backgroundColor: profile.bgColor }}
        ></div>
        <h3 className="text-xl font-semibold">{profile.name}</h3>
      </div>
      <p className="text-sm">{profile.description}</p>
    </div>
  );
}

interface ColorProfileDetailProps {
  color: ColorType;
}

export function ColorProfileDetail({ color }: ColorProfileDetailProps) {
  const profile = colorProfiles[color];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div 
            className="w-12 h-12 rounded-full mr-4" 
            style={{ backgroundColor: profile.bgColor }}
          ></div>
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
